import { render } from "@solidjs/testing-library";
import { describe, expect, it } from "vitest";
import Entry from "~/entry";

/**
 * @TODO
 * this is a test stub
 */
describe("App", () => {
  it("should render the app", () => {
    const { getByText } = render(() => <Entry />);
    expect(getByText("Web Socket")).toBeInTheDocument();
  });
});
