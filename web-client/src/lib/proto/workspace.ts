// @generated by protobuf-ts 2.9.1
// @generated from protobuf file "workspace.proto" (package "rs.devtools.workspace", syntax proto3)
// tslint:disable
import { ServiceType } from "@protobuf-ts/runtime-rpc";
import type { BinaryWriteOptions } from "@protobuf-ts/runtime";
import type { IBinaryWriter } from "@protobuf-ts/runtime";
import { WireType } from "@protobuf-ts/runtime";
import type { BinaryReadOptions } from "@protobuf-ts/runtime";
import type { IBinaryReader } from "@protobuf-ts/runtime";
import { UnknownFieldHandler } from "@protobuf-ts/runtime";
import type { PartialMessage } from "@protobuf-ts/runtime";
import { reflectionMergePartial } from "@protobuf-ts/runtime";
import { MESSAGE_TYPE } from "@protobuf-ts/runtime";
import { MessageType } from "@protobuf-ts/runtime";
/**
 * @generated from protobuf message rs.devtools.workspace.EntryRequest
 */
export interface EntryRequest {
    /**
     * The path of the directory to list
     * This is relative to the workspace root
     *
     * @generated from protobuf field: string path = 1;
     */
    path: string;
}
/**
 * @generated from protobuf message rs.devtools.workspace.Entry
 */
export interface Entry {
    /**
     * The path of the entry relative to the workspace root
     *
     * @generated from protobuf field: string path = 1;
     */
    path: string;
    /**
     * The size of the entry in bytes
     *
     * @generated from protobuf field: uint64 size = 2;
     */
    size: bigint;
    /**
     * A set of bitflags representing the type of the entry.
     * The following entries are defined:
     * 1 - Directory
     * 2 - File
     * 4 - Symbolic Link
     * 8 - Asset
     * 16 - Resource
     *
     * @generated from protobuf field: uint32 file_type = 3;
     */
    fileType: number;
}
/**
 * A chunk of bytes that make up a file
 *
 * @generated from protobuf message rs.devtools.workspace.Chunk
 */
export interface Chunk {
    /**
     * @generated from protobuf field: bytes bytes = 1;
     */
    bytes: Uint8Array;
}
// @generated message type with reflection information, may provide speed optimized methods
class EntryRequest$Type extends MessageType<EntryRequest> {
    constructor() {
        super("rs.devtools.workspace.EntryRequest", [
            { no: 1, name: "path", kind: "scalar", T: 9 /*ScalarType.STRING*/ }
        ]);
    }
    create(value?: PartialMessage<EntryRequest>): EntryRequest {
        const message = { path: "" };
        globalThis.Object.defineProperty(message, MESSAGE_TYPE, { enumerable: false, value: this });
        if (value !== undefined)
            reflectionMergePartial<EntryRequest>(this, message, value);
        return message;
    }
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: EntryRequest): EntryRequest {
        let message = target ?? this.create(), end = reader.pos + length;
        while (reader.pos < end) {
            let [fieldNo, wireType] = reader.tag();
            switch (fieldNo) {
                case /* string path */ 1:
                    message.path = reader.string();
                    break;
                default:
                    let u = options.readUnknownField;
                    if (u === "throw")
                        throw new globalThis.Error(`Unknown field ${fieldNo} (wire type ${wireType}) for ${this.typeName}`);
                    let d = reader.skip(wireType);
                    if (u !== false)
                        (u === true ? UnknownFieldHandler.onRead : u)(this.typeName, message, fieldNo, wireType, d);
            }
        }
        return message;
    }
    internalBinaryWrite(message: EntryRequest, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter {
        /* string path = 1; */
        if (message.path !== "")
            writer.tag(1, WireType.LengthDelimited).string(message.path);
        let u = options.writeUnknownFields;
        if (u !== false)
            (u == true ? UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
    }
}
/**
 * @generated MessageType for protobuf message rs.devtools.workspace.EntryRequest
 */
export const EntryRequest = new EntryRequest$Type();
// @generated message type with reflection information, may provide speed optimized methods
class Entry$Type extends MessageType<Entry> {
    constructor() {
        super("rs.devtools.workspace.Entry", [
            { no: 1, name: "path", kind: "scalar", T: 9 /*ScalarType.STRING*/ },
            { no: 2, name: "size", kind: "scalar", T: 4 /*ScalarType.UINT64*/, L: 0 /*LongType.BIGINT*/ },
            { no: 3, name: "file_type", kind: "scalar", T: 13 /*ScalarType.UINT32*/ }
        ]);
    }
    create(value?: PartialMessage<Entry>): Entry {
        const message = { path: "", size: 0n, fileType: 0 };
        globalThis.Object.defineProperty(message, MESSAGE_TYPE, { enumerable: false, value: this });
        if (value !== undefined)
            reflectionMergePartial<Entry>(this, message, value);
        return message;
    }
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: Entry): Entry {
        let message = target ?? this.create(), end = reader.pos + length;
        while (reader.pos < end) {
            let [fieldNo, wireType] = reader.tag();
            switch (fieldNo) {
                case /* string path */ 1:
                    message.path = reader.string();
                    break;
                case /* uint64 size */ 2:
                    message.size = reader.uint64().toBigInt();
                    break;
                case /* uint32 file_type */ 3:
                    message.fileType = reader.uint32();
                    break;
                default:
                    let u = options.readUnknownField;
                    if (u === "throw")
                        throw new globalThis.Error(`Unknown field ${fieldNo} (wire type ${wireType}) for ${this.typeName}`);
                    let d = reader.skip(wireType);
                    if (u !== false)
                        (u === true ? UnknownFieldHandler.onRead : u)(this.typeName, message, fieldNo, wireType, d);
            }
        }
        return message;
    }
    internalBinaryWrite(message: Entry, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter {
        /* string path = 1; */
        if (message.path !== "")
            writer.tag(1, WireType.LengthDelimited).string(message.path);
        /* uint64 size = 2; */
        if (message.size !== 0n)
            writer.tag(2, WireType.Varint).uint64(message.size);
        /* uint32 file_type = 3; */
        if (message.fileType !== 0)
            writer.tag(3, WireType.Varint).uint32(message.fileType);
        let u = options.writeUnknownFields;
        if (u !== false)
            (u == true ? UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
    }
}
/**
 * @generated MessageType for protobuf message rs.devtools.workspace.Entry
 */
export const Entry = new Entry$Type();
// @generated message type with reflection information, may provide speed optimized methods
class Chunk$Type extends MessageType<Chunk> {
    constructor() {
        super("rs.devtools.workspace.Chunk", [
            { no: 1, name: "bytes", kind: "scalar", T: 12 /*ScalarType.BYTES*/ }
        ]);
    }
    create(value?: PartialMessage<Chunk>): Chunk {
        const message = { bytes: new Uint8Array(0) };
        globalThis.Object.defineProperty(message, MESSAGE_TYPE, { enumerable: false, value: this });
        if (value !== undefined)
            reflectionMergePartial<Chunk>(this, message, value);
        return message;
    }
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: Chunk): Chunk {
        let message = target ?? this.create(), end = reader.pos + length;
        while (reader.pos < end) {
            let [fieldNo, wireType] = reader.tag();
            switch (fieldNo) {
                case /* bytes bytes */ 1:
                    message.bytes = reader.bytes();
                    break;
                default:
                    let u = options.readUnknownField;
                    if (u === "throw")
                        throw new globalThis.Error(`Unknown field ${fieldNo} (wire type ${wireType}) for ${this.typeName}`);
                    let d = reader.skip(wireType);
                    if (u !== false)
                        (u === true ? UnknownFieldHandler.onRead : u)(this.typeName, message, fieldNo, wireType, d);
            }
        }
        return message;
    }
    internalBinaryWrite(message: Chunk, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter {
        /* bytes bytes = 1; */
        if (message.bytes.length)
            writer.tag(1, WireType.LengthDelimited).bytes(message.bytes);
        let u = options.writeUnknownFields;
        if (u !== false)
            (u == true ? UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
    }
}
/**
 * @generated MessageType for protobuf message rs.devtools.workspace.Chunk
 */
export const Chunk = new Chunk$Type();
/**
 * @generated ServiceType for protobuf service rs.devtools.workspace.Workspace
 */
export const Workspace = new ServiceType("rs.devtools.workspace.Workspace", [
    { name: "ListEntries", serverStreaming: true, options: {}, I: EntryRequest, O: Entry },
    { name: "GetEntryBytes", serverStreaming: true, options: {}, I: EntryRequest, O: Chunk }
]);