/// A Rust source code location.
#[allow(clippy::derive_partial_eq_without_eq)]
#[derive(Clone, PartialEq, ::prost::Message)]
pub struct Location {
    /// The file path
    #[prost(string, optional, tag = "1")]
    pub file: ::core::option::Option<::prost::alloc::string::String>,
    /// The Rust module path
    #[prost(string, optional, tag = "2")]
    pub module_path: ::core::option::Option<::prost::alloc::string::String>,
    /// The line number in the source code file.
    #[prost(uint32, optional, tag = "3")]
    pub line: ::core::option::Option<u32>,
    /// The character in `line`.
    #[prost(uint32, optional, tag = "4")]
    pub column: ::core::option::Option<u32>,
}
/// Metadata associated with an event of span.
#[allow(clippy::derive_partial_eq_without_eq)]
#[derive(Clone, PartialEq, ::prost::Message)]
pub struct Metadata {
    /// The name of the span or event.
    #[prost(string, tag = "1")]
    pub name: ::prost::alloc::string::String,
    /// Describes the part of the system where the span or event that this
    /// metadata describes occurred.
    #[prost(string, tag = "2")]
    pub target: ::prost::alloc::string::String,
    /// The Rust source location associated with the span or event.
    #[prost(message, optional, tag = "3")]
    pub location: ::core::option::Option<Location>,
    /// Indicates whether metadata is associated with a span or with an event.
    #[prost(enumeration = "metadata::Kind", tag = "4")]
    pub kind: i32,
    /// Describes the level of verbosity of a span or event.
    #[prost(enumeration = "metadata::Level", tag = "5")]
    pub level: i32,
    /// The names of the key-value fields attached to the
    /// span or event this metadata is associated with.
    #[prost(string, repeated, tag = "6")]
    pub field_names: ::prost::alloc::vec::Vec<::prost::alloc::string::String>,
}
/// Nested message and enum types in `Metadata`.
pub mod metadata {
    /// Indicates whether metadata is associated with a span or with an event.
    #[derive(
        Clone,
        Copy,
        Debug,
        PartialEq,
        Eq,
        Hash,
        PartialOrd,
        Ord,
        ::prost::Enumeration
    )]
    #[repr(i32)]
    pub enum Kind {
        /// Indicates metadata is associated with a span.
        Span = 0,
        /// Indicates metadata is associated with an event.
        Event = 1,
    }
    impl Kind {
        /// String value of the enum field names used in the ProtoBuf definition.
        ///
        /// The values are not transformed in any way and thus are considered stable
        /// (if the ProtoBuf definition does not change) and safe for programmatic use.
        pub fn as_str_name(&self) -> &'static str {
            match self {
                Kind::Span => "SPAN",
                Kind::Event => "EVENT",
            }
        }
        /// Creates an enum from field names used in the ProtoBuf definition.
        pub fn from_str_name(value: &str) -> ::core::option::Option<Self> {
            match value {
                "SPAN" => Some(Self::Span),
                "EVENT" => Some(Self::Event),
                _ => None,
            }
        }
    }
    /// Describes the level of verbosity of a span or event.
    ///
    /// Corresponds to `Level` in the `tracing` crate.
    #[derive(
        Clone,
        Copy,
        Debug,
        PartialEq,
        Eq,
        Hash,
        PartialOrd,
        Ord,
        ::prost::Enumeration
    )]
    #[repr(i32)]
    pub enum Level {
        /// The "error" level.
        ///
        /// Designates very serious errors.
        Error = 0,
        /// The "warn" level.
        ///
        /// Designates hazardous situations.
        Warn = 1,
        /// The "info" level.
        /// Designates useful information.
        Info = 2,
        /// The "debug" level.
        ///
        /// Designates lower priority information.
        Debug = 3,
        /// The "trace" level.
        ///
        /// Designates very low priority, often extremely verbose, information.
        Trace = 4,
    }
    impl Level {
        /// String value of the enum field names used in the ProtoBuf definition.
        ///
        /// The values are not transformed in any way and thus are considered stable
        /// (if the ProtoBuf definition does not change) and safe for programmatic use.
        pub fn as_str_name(&self) -> &'static str {
            match self {
                Level::Error => "ERROR",
                Level::Warn => "WARN",
                Level::Info => "INFO",
                Level::Debug => "DEBUG",
                Level::Trace => "TRACE",
            }
        }
        /// Creates an enum from field names used in the ProtoBuf definition.
        pub fn from_str_name(value: &str) -> ::core::option::Option<Self> {
            match value {
                "ERROR" => Some(Self::Error),
                "WARN" => Some(Self::Warn),
                "INFO" => Some(Self::Info),
                "DEBUG" => Some(Self::Debug),
                "TRACE" => Some(Self::Trace),
                _ => None,
            }
        }
    }
}
/// One metadata element registered since the last update.
#[allow(clippy::derive_partial_eq_without_eq)]
#[derive(Clone, PartialEq, ::prost::Message)]
pub struct NewMetadata {
    /// Unique identifier for `metadata`.
    #[prost(uint64, optional, tag = "1")]
    pub id: ::core::option::Option<u64>,
    /// The metadata payload.
    #[prost(message, optional, tag = "2")]
    pub metadata: ::core::option::Option<Metadata>,
}
/// A message representing a key-value pair of data associated with a `Span`
#[allow(clippy::derive_partial_eq_without_eq)]
#[derive(Clone, PartialEq, ::prost::Message)]
pub struct Field {
    /// Metadata for the task span that the field came from.
    #[prost(uint64, tag = "8")]
    pub metadata_id: u64,
    /// The key of the key-value pair.
    ///
    /// This is either represented as a string, or as an index into a `Metadata`'s
    /// array of field name strings.
    #[prost(oneof = "field::Name", tags = "1, 2")]
    pub name: ::core::option::Option<field::Name>,
    /// The value of the key-value pair.
    #[prost(oneof = "field::Value", tags = "3, 4, 5, 6, 7")]
    pub value: ::core::option::Option<field::Value>,
}
/// Nested message and enum types in `Field`.
pub mod field {
    /// The key of the key-value pair.
    ///
    /// This is either represented as a string, or as an index into a `Metadata`'s
    /// array of field name strings.
    #[allow(clippy::derive_partial_eq_without_eq)]
    #[derive(Clone, PartialEq, ::prost::Oneof)]
    pub enum Name {
        /// The string representation of the name.
        #[prost(string, tag = "1")]
        StrName(::prost::alloc::string::String),
        /// An index position into the `Metadata.field_names` of the metadata
        /// for the task span that the field came from.
        #[prost(uint64, tag = "2")]
        NameIdx(u64),
    }
    /// The value of the key-value pair.
    #[allow(clippy::derive_partial_eq_without_eq)]
    #[derive(Clone, PartialEq, ::prost::Oneof)]
    pub enum Value {
        /// A value serialized to a string using `fmt::Debug`.
        #[prost(string, tag = "3")]
        DebugVal(::prost::alloc::string::String),
        /// A string value.
        #[prost(string, tag = "4")]
        StrVal(::prost::alloc::string::String),
        /// An unsigned integer value.
        #[prost(uint64, tag = "5")]
        U64Val(u64),
        /// A signed integer value.
        #[prost(sint64, tag = "6")]
        I64Val(i64),
        /// A boolean value.
        #[prost(bool, tag = "7")]
        BoolVal(bool),
    }
}
