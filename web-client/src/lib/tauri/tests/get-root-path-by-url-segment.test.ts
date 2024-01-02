import { getRootPathByUrlSegment } from "../get-tauri-tab-base-path";

describe("getRootPathByUrlSegment", () => {
  it("Should be able to find base path if we are on it", () => {
    expect(
      getRootPathByUrlSegment(
        "http://localhost:5173/app/dash/127.0.0.1/3000/calls",
        "calls"
      )
    ).toBe("http://localhost:5173/app/dash/127.0.0.1/3000/calls");
  });

  it("Should be able to find base path if we are on it, even if it has search params", () => {
    expect(
      getRootPathByUrlSegment(
        "http://localhost:5173/app/dash/127.0.0.1/3000/calls?span=9007199254740996",
        "calls"
      )
    ).toBe("http://localhost:5173/app/dash/127.0.0.1/3000/calls");
  });

  it("Should be abe to find base path even if the key exists twice", () => {
    expect(
      getRootPathByUrlSegment(
        "http://localhost:5173/app/dash/127.0.0.1/3000/tauri/tauri.conf.json/tauri?size=0",
        "tauri"
      )
    ).toBe("http://localhost:5173/app/dash/127.0.0.1/3000/tauri");
  });
});
