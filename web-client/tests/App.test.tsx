import { Router } from "@solidjs/router";
import { render } from "@solidjs/testing-library";
import { describe, expect, it } from "vitest";
import Entry from "~/entry";

/**
 * @TODO
 * this is a test stub
 */
describe("App", () => {
  it("should render the app", async () => {
    /**
     * must await `render()` because all routes are async
     */
    const { findByText } = await render(() => <Entry />, {
      wrapper: Router,
    });

    expect(await findByText("Web Socket")).toBeInTheDocument();
  });
});
