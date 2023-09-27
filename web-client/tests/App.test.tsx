import { Router } from "@solidjs/router";
import { render } from "@solidjs/testing-library";
import { describe, expect, it } from "vitest";
import Connect from "~/views/connect";

/**
 * @TODO
 * this is a test stub
 */
describe("App", () => {
  it("should render the app", () => {
    const { getByText } = render(() => <Connect />, { wrapper: Router });
    expect(getByText("Web Socket")).toBeInTheDocument();
  });
});
