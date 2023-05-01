import { describe, expect, test } from "@jest/globals";
import { nil, number } from "./value";
import { bool } from "./value";
import parse from "./parse";
import lex from "./lex";
import evaluate from "./eval";

describe("evaluate", () => {
    test.each([
        ["()", nil()],
        ["#t", bool(true)],
        ["#f", bool(false)],
        ["0", number(0)],
        ["123", number(123)],
        ["-4.5", number(-4.5)]
    ])("literal %p", (program, expected) => {
        const expr = parse(lex(program));
        const actual = evaluate(expr);
        expect(actual).toEqual(expected);
    });
});