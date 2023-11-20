import { SourcesClient } from "~/lib/proto/sources.client.ts";
import { createResource } from "solid-js";
import { Entry } from "~/lib/proto/sources.ts";
import { RpcOutputStream } from "@protobuf-ts/runtime-rpc";
import { Chunk } from "~/lib/proto/sources.ts";

export function encodeFileName(path: string) {
  return path.replaceAll(".", "-");
}

export function decodeFileName(path: string) {
  return path.replaceAll("-", ".");
}

export function awaitEntries(client: SourcesClient, path: string) {
  return createResource(client, async (client) => {
    const entries = [];
    try {
      const call = client.listEntries({ path });

      for await (const entry of call.responses) {
        entries.push(entry);
      }

      return entries;
    } catch (e) {
      throw new Error(`Failed to list entries for path ${path}`);
    }
  });
}

export async function getEntryBytes(
  client: SourcesClient,
  path: string,
  size: number | undefined
) {
  const call = client.getEntryBytes({ path });

  if (size)
    return await getEntryBytesBySize(call.responses, size, client, path);

  return await getEntryBytesWithoutSize(call.responses);
}

async function getEntryBytesWithoutSize(callResponses: RpcOutputStream<Chunk>) {
  return new Uint8Array(
    await fillArrayByCallResponses(new entryBytesArray(), callResponses)
  );
}

async function getEntryBytesBySize(
  callResponses: RpcOutputStream<Chunk>,
  size: number,
  client: SourcesClient,
  path: string
): Promise<Uint8Array | undefined> {
  try {
    return await fillArrayByCallResponses(new Uint8Array(size), callResponses);
  } catch (e) {
    if (!(e instanceof RangeError)) return undefined;
    return await getEntryBytes(client, path, undefined);
  }
}

async function fillArrayByCallResponses(
  array: Uint8Array,
  callResponses: RpcOutputStream<Chunk>
): Promise<Uint8Array>;
async function fillArrayByCallResponses(
  array: entryBytesArray,
  callResponses: RpcOutputStream<Chunk>
): Promise<entryBytesArray>;
async function fillArrayByCallResponses(
  array: Uint8Array | entryBytesArray,
  callResponses: RpcOutputStream<Chunk>
) {
  let offset = 0;
  for await (const chunk of callResponses) {
    array.set(chunk.bytes, offset);
    offset += chunk.bytes.length;
  }
  return array;
}

class entryBytesArray extends Array {
  set(array: Uint8Array, offset: number) {
    for (let i = offset; i < array.length + offset; i++)
      this[i] = array[i - offset];
  }
}

export const FileType = {
  DIR: 1 << 0,
  FILE: 1 << 1,
  SYMLINK: 1 << 2,
  ASSET: 1 << 3,
  RESOURCE: 1 << 4,
};

export function isDirectory(entry: Entry): boolean {
  return !!(entry.fileType & FileType.DIR);
}

export function isAssetOrResource(entry: Entry): boolean {
  return (
    !!(entry.fileType & FileType.ASSET) ||
    !!(entry.fileType & FileType.RESOURCE)
  );
}
export function sortByPath(a: Entry, b: Entry) {
  return a.path.localeCompare(b.path);
}

export function guessContentType(path: string): string | undefined {
  const ext = path.slice(path.lastIndexOf(".") + 1);

  return {
    rs: "code/rust",
    toml: "code/toml",
    lock: "code/toml",
    js: "code/javascript",
    jsx: "code/javascript",
    ts: "code/typescript",
    tsx: "code/typescript",
    json: "code/json",
    html: "code/html",
    css: "code/css",
    md: "code/markdown",
    yml: "code/yaml",
    yaml: "code/yaml",

    jpeg: "image/jpeg",
    jpg: "image/jpeg",
    png: "image/png",
    gif: "image/gif",
    svg: "image/svg+xml",
    avif: "image/avif",
    webp: "image/webp",
    ico: "image/x-icon",

    mp4: "video/mp4",
    webm: "video/webm",
  }[ext];
}
