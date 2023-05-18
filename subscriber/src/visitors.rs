use tracing_core::field::Visit;

pub struct FieldVisitor {
    fields: Vec<api::Field>,
    meta_id: api::MetaId,
}

impl FieldVisitor {
    pub(crate) fn new(meta_id: api::MetaId) -> Self {
        FieldVisitor {
            fields: Vec::default(),
            meta_id,
        }
    }
    pub(crate) fn result(self) -> Vec<api::Field> {
        self.fields
    }
}

impl Visit for FieldVisitor {
    fn record_debug(&mut self, field: &tracing_core::Field, value: &dyn std::fmt::Debug) {
        self.fields.push(api::Field {
            metadata_id: Some(self.meta_id.clone()),
            name: Some(field.name().into()),
            value: Some(value.into()),
        })
    }
}
