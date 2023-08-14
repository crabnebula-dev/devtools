#![allow(non_snake_case)]

use dioxus::prelude::*;
use futures_util::StreamExt;
use mdns_sd::ServiceDaemon;
use parking_lot::Mutex;
use semver::Version;
use serde::Serialize;
use std::{
    collections::HashMap,
    net::{IpAddr, SocketAddr},
    sync::Arc,
    time::SystemTime,
};
use wire::instrument::{instrument_client, Interests};

fn main() {
    dioxus_desktop::launch(App);
}

#[derive(Debug, Clone)]
struct Target {
    description: String,
    authors: String,
    version: Version,
    tauri_version: Version,
    webview_version: String,
    os: String,
    arch: String,
    addresses: Vec<SocketAddr>,
}

fn App(cx: Scope) -> Element {
    let all_targets = use_state::<HashMap<String, Target>>(cx, || HashMap::new());
    let current_target = use_state::<Option<String>>(cx, || None);

    use_coroutine(cx, |_: UnboundedReceiver<()>| {
        to_owned![all_targets];

        async move {
            let mdns = ServiceDaemon::new().expect("Failed to create daemon");

            let receiver = mdns.browse("_CNDinstrument._udp.local.").unwrap();
            let mut stream = receiver.into_stream();

            while let Some(event) = stream.next().await {
                match event {
                    mdns_sd::ServiceEvent::ServiceResolved(info) => {
                        println!("found target");

                        all_targets.modify(|all_targets| {
                            let mut all_targets = all_targets.clone();
                            all_targets.insert(
                                info.get_fullname().to_string(),
                                Target {
                                    description: info
                                        .get_property_val_str("DESCRIPTION")
                                        .unwrap()
                                        .to_string(),
                                    authors: info
                                        .get_property_val_str("AUTHORS")
                                        .unwrap()
                                        .to_string(),
                                    version: Version::parse(
                                        info.get_property_val_str("VERSION").unwrap(),
                                    )
                                    .unwrap(),
                                    tauri_version: Version::parse(
                                        info.get_property_val_str("TAURI_VERSION").unwrap(),
                                    )
                                    .unwrap(),
                                    webview_version: info
                                        .get_property_val_str("WEBVIEW_VERSION")
                                        .unwrap()
                                        .to_string(),
                                    os: info.get_property_val_str("OS").unwrap().to_string(),
                                    arch: info.get_property_val_str("ARCH").unwrap().to_string(),
                                    addresses: info
                                        .get_addresses()
                                        .iter()
                                        .map(|ip| SocketAddr::new(IpAddr::V4(*ip), info.get_port()))
                                        .collect(),
                                },
                            );

                            all_targets
                        })
                    }
                    _ => {}
                }
            }
        }
    });

    cx.render(rsx! {
        TargetSelector {
            all_targets: all_targets,
            on_change: |ev: Event<FormData>| current_target.set(Some(ev.data.value.to_string()))
        }
        if let Some(id) = current_target.get() {
            rsx! {
                Session {
                    target: all_targets.get().get(id).unwrap()
                }
            }
        }
    })
}

#[inline_props]
fn TargetSelector<'a>(
    cx: Scope<'a>,
    all_targets: &'a HashMap<String, Target>,
    on_change: EventHandler<'a, FormEvent>,
) -> Element<'a> {
    cx.render(rsx! {
        select {
            onchange: move |ev| { on_change.call(ev); },
            option {
                value: "",
                selected: true,
                disabled: true,
                "Select a Target"
            }
            for (id, target) in all_targets.iter() {
                option {
                    value: "{id}",
                    "{id.split_once(\".\").unwrap().0}@{target.version} - Tauri@{target.tauri_version} - {target.arch}_{target.os}"
                }
            }
        }
    })
}

#[derive(Debug, Default)]
struct InternedStrings {
    string2idx: HashMap<Arc<str>, usize>,
    strings: Vec<Arc<str>>,
}

type InternedStr = usize;

#[derive(Debug, Default)]
struct State {
    last_updated_at: Option<SystemTime>,
    metas: HashMap<u64, Metadata>,
    logs_state: LogsState,
    strings: InternedStrings,
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

#[derive(Debug, Clone, Serialize)]
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
    fields: Vec<Field>,
}

#[derive(Debug, Clone, Serialize)]
pub enum Level {
    Error = 0,
    Warn = 1,
    Info = 2,
    Debug = 3,
    Trace = 4,
}

#[derive(Debug)]
enum InstrumentCommand {
    UpdateInterests(Interests),
}

impl State {
    pub fn apply_update(&mut self, update: wire::instrument::Update) {
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
                .extend(log_update.new_events.into_iter().filter_map(|ev| {
                    let meta = self.metas.get(&ev.metadata_id.as_ref()?.id)?;

                    LogRecord::from_proto(ev, meta, &mut self.strings)
                }));

            self.logs_state.new_events = self.logs_state.events.len() - old;

            self.logs_state.dropped_events = log_update.dropped_events;
        }
    }
}

impl InternedStrings {
    fn intern_str(&mut self, string: &str) -> usize {
        if let Some(idx) = self.string2idx.get(string) {
            return *idx;
        }

        let string: Arc<str> = string.into();
        let idx = self.strings.len();
        self.strings.push(string.clone());
        self.string2idx.insert(string, idx);

        idx
    }

    pub fn get(&self, str: InternedStr) -> &str {
        &self.strings[str]
    }
}

impl Metadata {
    fn from_proto(
        proto: wire::register_metadata::NewMetadata,
        strings: &mut InternedStrings,
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
    pub fn from_proto(
        proto: wire::log::Event,
        meta: &Metadata,
        strings: &mut InternedStrings,
    ) -> Option<Self> {
        let message = proto.fields.iter().find_map(|field| {
            if field.name == Some("message".into()) {
                Some(FieldValue::from_proto(field.value.as_ref()?, strings))
            } else {
                None
            }
        })?;

        let fields = proto
            .fields
            .into_iter()
            .filter_map(|field| {
                let name = match field.name? {
                    wire::field::Name::StrName(str) => strings.intern_str(&str),
                    wire::field::Name::NameIdx(idx) => meta.field_names[idx as usize],
                };

                Some(Field {
                    name,
                    value: FieldValue::from_proto(field.value.as_ref()?, strings),
                })
            })
            .collect();

        Some(Self {
            at: proto.at.clone()?.try_into().ok()?,
            message,
            metadata_id: meta.id,
            fields,
        })
    }
}

impl FieldValue {
    pub fn from_proto(proto: &wire::field::Value, strings: &mut InternedStrings) -> Self {
        match proto {
            wire::field::Value::DebugVal(str) => Self::Debug(strings.intern_str(str)),
            wire::field::Value::StrVal(str) => Self::Str(strings.intern_str(str)),
            wire::field::Value::U64Val(v) => Self::U64(*v),
            wire::field::Value::I64Val(v) => Self::I64(*v),
            wire::field::Value::BoolVal(v) => Self::Bool(*v),
        }
    }

    pub fn to_string<'a>(&self, strings: &'a InternedStrings) -> String {
        match self {
            FieldValue::Bool(val) => val.to_string(),
            FieldValue::U64(val) => val.to_string(),
            FieldValue::I64(val) => val.to_string(),
            FieldValue::Str(str) => strings.get(*str).to_owned(),
            FieldValue::Debug(str) => strings.get(*str).to_owned(),
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

#[inline_props]
fn Session<'a>(cx: Scope<'a>, target: &'a Target) -> Element<'a> {
    let state = use_state(cx, || Mutex::new(State::default()));

    let addr = tonic::transport::Uri::builder()
        .scheme("http")
        .authority(target.addresses.iter().next().unwrap().to_string())
        .path_and_query("/")
        .build()
        .unwrap();

    let instrument_task = use_coroutine(cx, |mut rx: UnboundedReceiver<InstrumentCommand>| {
        to_owned![state];

        async move {
            let mut stream = instrument_client::InstrumentClient::connect(addr)
                .await
                .unwrap()
                .watch_updates(wire::instrument::InstrumentRequest::new())
                .await
                .unwrap()
                .into_inner();

            loop {
                tokio::select! {
                    Some(cmd) = rx.next() => {
                        println!("received command {cmd:?}")
                    }
                    Some(Ok(update)) = stream.next() => {
                        let mut state_inner = state.lock();
                        state_inner.apply_update(update);
                        drop(state_inner);
                        state.needs_update();
                    }
                    else => {
                        println!("nothing left to poll");
                        return;
                    }
                }
            }
        }
    });

    let state = &state.lock();
    let log_state = &state.logs_state;
    cx.render(rsx! {
        h1 {
            "Logs"
        }
        ol {
            for event in log_state.events.iter() {
                li {
                    event.message.to_string(&state.strings)
                }
            }
        }
    })
}
