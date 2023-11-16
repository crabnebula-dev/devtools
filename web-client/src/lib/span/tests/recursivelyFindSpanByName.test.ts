import { describe, expect } from "vitest";
import { recursivelyFindSpanByName } from "../recursivelyFindSpanByName";
import { metadata } from "./fixtures/metadata";
import { spans } from "./fixtures/spans"

describe("recursivelyFindSpanByName", () => {
    it('should recurisvely find a span by name', () => {
        // @ts-expect-error this is a test...
        expect(recursivelyFindSpanByName({ span: spans[0], metadata }, 'cmd')).toMatchSnapshot()
    })
})