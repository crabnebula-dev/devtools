use crate::{util::TimeAnchor, Include, ToProto, Unsent};
use std::collections::HashMap;

pub(crate) struct IdMap<T>(HashMap<tracing_core::span::Id, T>);

impl<T> IdMap<T> {
    pub fn new() -> Self {
        Self(HashMap::new())
    }

    pub fn insert(&mut self, id: tracing_core::span::Id, data: T) {
        self.0.insert(id, data);
    }

    pub(crate) fn all(&self) -> impl Iterator<Item = (&tracing_core::span::Id, &T)> {
        self.0.iter()
    }
}

impl<T: Unsent> IdMap<T> {
    fn since_last_update(&self) -> impl Iterator<Item = (&tracing_core::span::Id, &T)> {
        self.0.iter().filter_map(|(id, data)| {
            if data.take_unsent() {
                Some((id, data))
            } else {
                None
            }
        })
    }
}

impl<T: ToProto + Unsent> IdMap<T> {
    pub fn to_proto_list(&self, include: Include, base_time: &TimeAnchor) -> Vec<T::Output> {
        match include {
            Include::All => self.all().map(|(_, t)| t.to_proto(base_time)).collect(),
            Include::UpdateOnly => self
                .since_last_update()
                .map(|(_, t)| t.to_proto(base_time))
                .collect(),
        }
    }

    pub fn to_proto_map(
        &self,
        include: Include,
        base_time: &TimeAnchor,
    ) -> HashMap<u64, T::Output> {
        match include {
            Include::All => self
                .all()
                .map(|(id, t)| (id.into_u64(), t.to_proto(base_time)))
                .collect(),
            Include::UpdateOnly => self
                .since_last_update()
                .map(|(id, t)| (id.into_u64(), t.to_proto(base_time)))
                .collect(),
        }
    }
}
