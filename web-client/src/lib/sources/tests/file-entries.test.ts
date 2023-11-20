import { getEntryBytes } from "../file-entries";

const length = 512;
const buffer = window.crypto.getRandomValues(new Uint8Array(length));

async function* fileResponse() {
  yield { bytes: buffer };
}

class SourcesClient {
  getEntryBytes() {
    return {
      responses: fileResponse(),
    };
  }
}

describe("fileEntries", () => {
  it("should get file entries with file size", async () => {
    // @ts-expect-error this is a test...
    const entry = await getEntryBytes(new SourcesClient(), "", length);
    expect(entry?.length).toBe(length);
  });

  it("should get file entries without file size", async () => {
    // @ts-expect-error this is a test...
    const entry = await getEntryBytes(new SourcesClient(), "");
    expect(entry?.length).toBe(length);
  });
});
