import { SourcesClient } from "~/lib/proto/sources.client.ts";
import { createResource } from "solid-js";
import { Entry } from "~/lib/proto/sources.ts";
import { RpcOutputStream } from "@protobuf-ts/runtime-rpc";
import { Chunk } from "~/lib/proto/sources.ts";
import { useMonitor } from "~/context/monitor-provider";
import { useConnection } from "~/context/connection-provider";

/**
 * Browsers and Routers decode URLs. Since a filename is a piece of a URL, this is breaking our decoding.
 * So we come up with a stamp (`%DDD`) to allow our sanitization to work without getting confused
 **/

export function encodeFileName(path: string) {
  return encodeURIComponent(path.replaceAll(".", "%DDD"));
}

export function decodeFileName(path: string) {
  return decodeURIComponent(path).replaceAll("%DDD", ".");
}

export function awaitEntries(path: string) {
  return createResource(async () => {
    const { monitorData } = useMonitor();
    const { connectionStore } = useConnection();

    const client = connectionStore.client.sources;
    const health = monitorData.health;

    const entries: Entry[] = [];
    if (health === 0) return entries;

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
  size: number | undefined,
): Promise<Uint8Array | undefined> {
  const call = client.getEntryBytes({ path });

  if (size) {
    try {
      return await fillWithChunkStream(new Uint8Array(size), call.responses);
    } catch (e) {
      if (!(e instanceof RangeError)) return undefined;
      return await getEntryBytes(client, path, undefined);
    }
  }

  return new Uint8Array(await fillWithChunkStream([], call.responses));
}

async function fillWithChunkStream(
  array: Uint8Array,
  callResponses: RpcOutputStream<Chunk>,
): Promise<Uint8Array>;
async function fillWithChunkStream(
  array: number[],
  callResponses: RpcOutputStream<Chunk>,
): Promise<number[]>;
async function fillWithChunkStream(
  array: Uint8Array | number[],
  callResponses: RpcOutputStream<Chunk>,
) {
  let offset = 0;
  for await (const chunk of callResponses) {
    if (array instanceof Uint8Array) {
      array.set(chunk.bytes, offset);
      offset += chunk.bytes.length;
    } else {
      array = array.concat(...chunk.bytes);
    }
  }
  return array;
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
    txt: "code/txt",
    toml: "code/toml",
    lock: "code/toml",
    js: "code/js",
    jsx: "code/jsx",
    ts: "code/ts",
    tsx: "code/tsx",
    json: "code/json",
    html: "code/html",
    css: "code/css",
    md: "code/md",
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
