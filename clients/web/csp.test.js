import { describe, expect, it } from "vitest";
import { generateCSP } from "./csp";

describe("generateCSP", () => {
  it("generates the CSP headers", () => {
    const withoutFathom = {
      production: generateCSP(),
      development: generateCSP(true),
    };

    expect({
      withoutFathom,
      withFathom: {
        production: generateCSP(false, "https://cdn.usefathom.com/script.js"),
        development: generateCSP(true, "https://cdn.usefathom.com/script.js"),
      },
    }).toMatchSnapshot();
  });
});
