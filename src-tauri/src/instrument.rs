use std::{collections::HashMap, sync::Arc, time::SystemTime};

use api::instrument::{instrument_client::InstrumentClient, InstrumentRequest};
use futures::StreamExt;
use serde::Serialize;
use tauri::{
    async_runtime::Mutex,
    plugin::{Builder, TauriPlugin},
    AppHandle, Manager, Runtime,
};

type InternedStr = usize;

struct State<R: Runtime>(Mutex<StateInner<R>>);

#[derive(Debug)]
struct StateInner<R: Runtime> {
    connected: bool,
    metas: HashMap<u64, Metadata>,
    last_updated_at: Option<SystemTime>,

    logs_state: LogsState,

    strings: InternedStrings<R>,
}

#[derive(Debug)]
struct InternedStrings<R: Runtime> {
    string2idx: HashMap<Arc<str>, usize>,
    strings: Vec<Arc<str>>,
    app_handle: AppHandle<R>,
}

#[derive(Debug, Serialize)]
pub struct Metadata {
    field_names: Vec<InternedStr>,
    target: InternedStr,
    id: u64,
    level: Level,
    file: InternedStr,
    module_path: InternedStr,
    line: u32,
    column: u32,
}

#[derive(Debug, Serialize)]
struct Field {
    name: InternedStr,
    value: FieldValue,
}

#[derive(Debug, Clone, Serialize)]
enum FieldValue {
    Bool(bool),
    Str(InternedStr),
    U64(u64),
    I64(i64),
    Debug(InternedStr),
}

#[derive(Default, Debug)]
pub struct LogsState {
    events: Vec<LogRecord>,
    new_events: usize,
    dropped_events: u64,
}

#[derive(Debug, Clone, Serialize)]
struct LogRecord {
    at: SystemTime,
    message: FieldValue,
    metadata_id: u64,
}

#[derive(Debug, Clone, Serialize)]
pub enum Level {
    Error = 0,
    Warn = 1,
    Info = 2,
    Debug = 3,
    Trace = 4,
}

#[tauri::command]
async fn get_string_map<R: Runtime>(
    _: tauri::AppHandle<R>,
    state: tauri::State<'_, State<R>>,
) -> Result<HashMap<usize, String>, ()> {
    let state = state.0.lock().await;

    let out = state
        .strings
        .string2idx
        .iter()
        .map(|(str, idx)| (*idx, str.to_string()))
        .collect();

    Ok(out)
}

#[tauri::command]
async fn connect<R: Runtime>(
    app_handle: tauri::AppHandle<R>,
    _state: tauri::State<'_, State<R>>,
    addrs: String,
    port: u16,
) -> Result<(), ()> {
    let mut state = _state.0.lock().await;

    if state.connected {
        return Ok(());
    }

    let mut addrs = addrs.split(',');
    let first_addr = addrs.next().unwrap().to_string();

    let mut instrument_client = InstrumentClient::connect(format!("http://{first_addr}:{port}"))
        .await
        .unwrap();

    state.connected = true;

    drop(state);

    log::info!("instrument client connected");

    let mut stream = instrument_client
        .watch_updates(InstrumentRequest::new())
        .await
        .unwrap()
        .into_inner();

    while let Some(instrument_update) = stream.next().await {
        let mut state = _state.0.lock().await;
        state.update(instrument_update.unwrap());

        // render

        let events_to_render =
            &state.logs_state.events[state.logs_state.events.len() - state.logs_state.new_events..];

        for ev in events_to_render {
            let metadata = state.metas.get(&ev.metadata_id).unwrap();

            let _ = app_handle.emit_all("log_event", (ev, metadata));
        }

        state.logs_state.new_events = 0;
    }

    Ok(())
}

pub fn init<R: Runtime>() -> TauriPlugin<R> {
    Builder::new("instrument")
        .invoke_handler(tauri::generate_handler![connect, get_string_map])
        .setup(|app_handle| {
            app_handle.manage(State(Mutex::new(StateInner {
                connected: false,
                metas: HashMap::default(),
                last_updated_at: None,
                logs_state: LogsState::default(),
                strings: InternedStrings {
                    string2idx: HashMap::default(),
                    strings: Vec::default(),
                    app_handle: app_handle.clone(),
                },
            })));

            Ok(())
        })
        .build()
}

impl<R: Runtime> StateInner<R> {
    pub fn update(&mut self, update: api::instrument::Update) {
        if let Some(now) = update.now.map(|v| v.try_into().unwrap()) {
            self.last_updated_at = Some(now);
        }

        if let Some(new_metadata) = update.new_metadata {
            for meta in new_metadata.metadata {
                let meta = Metadata::from_proto(meta, &mut self.strings).unwrap();

                self.metas.insert(meta.id, meta);
            }
        }

        if let Some(log_update) = update.log_update {
            let old = self.logs_state.events.len();

            self.logs_state
                .events
                .extend(log_update.new_events.iter().filter_map(|ev| {
                    let meta = self.metas.get(&ev.metadata_id.as_ref()?.id)?;

                    LogRecord::from_proto(ev, meta, &mut self.strings)
                }));
            
            self.logs_state.new_events = self.logs_state.events.len() - old;

            self.logs_state.dropped_events = log_update.dropped_events;
        }
    }
}

impl<R: Runtime> InternedStrings<R> {
    fn intern_str(&mut self, string: &str) -> usize {
        if let Some(idx) = self.string2idx.get(string) {
            return *idx;
        }

        let string: Arc<str> = string.into();
        let idx = self.strings.len();
        self.strings.push(string.clone());

        let _ = self.app_handle.emit_all("intern-str", (idx, &*string));

        self.string2idx.insert(string, idx);

        idx
    }
}

impl Metadata {
    fn from_proto<R: Runtime>(
        proto: api::register_metadata::NewMetadata,
        strings: &mut InternedStrings<R>,
    ) -> Option<Self> {
        let meta = proto.metadata?;
        let location = meta.location.as_ref()?;

        Some(Metadata {
            field_names: meta
                .field_names
                .into_iter()
                .map(|name| strings.intern_str(&name))
                .collect(),
            target: strings.intern_str(&meta.target),
            id: proto.id?.id,
            level: Level::from(meta.level),
            file: strings.intern_str(location.file()),
            module_path: strings.intern_str(location.module_path()),
            line: location.line(),
            column: location.column(),
        })
    }
}

impl LogRecord {
    pub fn from_proto<R: Runtime>(
        proto: &api::log::Event,
        meta: &Metadata,
        strings: &mut InternedStrings<R>,
    ) -> Option<Self> {
        let message = proto.fields.iter().find_map(|field| {
            if field.name == Some("message".into()) {
                Some(FieldValue::from_proto(field.value.as_ref()?, strings))
            } else {
                None
            }
        })?;

        Some(Self {
            at: proto.at.clone()?.try_into().ok()?,
            message,
            metadata_id: meta.id,
        })
    }
}

impl FieldValue {
    pub fn from_proto<R: Runtime>(
        proto: &api::field::Value,
        strings: &mut InternedStrings<R>,
    ) -> Self {
        match proto {
            api::field::Value::DebugVal(str) => Self::Debug(strings.intern_str(str)),
            api::field::Value::StrVal(str) => Self::Str(strings.intern_str(str)),
            api::field::Value::U64Val(v) => Self::U64(*v),
            api::field::Value::I64Val(v) => Self::I64(*v),
            api::field::Value::BoolVal(v) => Self::Bool(*v),
        }
    }
}

impl From<i32> for Level {
    fn from(value: i32) -> Self {
        match value {
            0 => Self::Error,
            1 => Self::Warn,
            2 => Self::Info,
            3 => Self::Debug,
            4 => Self::Trace,
            _ => panic!(),
        }
    }
}
