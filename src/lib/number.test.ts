import { describe, expect, test } from "@jest/globals";
import parse from "../parse";
import lex from "../lex";
import evaluate from "../eval";
import { bool, number } from "../value";

describe("number", () => {
    test.each([
        ["(+)", number(0)],
        ["(*)", number(1)],
        ["(+ 2)", number(2)],
        ["(* 3)", number(3)],
        ["(- 4)", number(-4)],
        ["(/ 5)", number(1 / 5)],
        ["(+ 6 7.8)", number(13.8)],
        ["(* 9 10)", number(90)],
        ["(- 1112 13)", number(1099)],
        ["(/ 14 15)", number(14 / 15)],
        ["(+ 16 17.18 19)", number(52.18)],
        ["(* 20 21 22)", number(9240)],
        ["(- 2324 25.26 27)", number(2271.74)],
        ["(/ 28 29 30)", number(28 / 29 / 30)],
        ["(= 1 1 1)", bool(true)],
        ["(= 1 1 2)", bool(false)],
        ["(< 1 2 3)", bool(true)],
        ["(< 1 1 2)", bool(false)],
        ["(< 1 3 2)", bool(false)],
        ["(<= 1 1 1)", bool(true)],
        ["(<= 1 1 2)", bool(true)],
        ["(<= 1 2 3)", bool(true)],
        ["(<= 1 2 1)", bool(false)],
        ["(> 3 2 1)", bool(true)],
        ["(> 2 2 1)", bool(false)],
        ["(> 3 1 2)", bool(false)],
        ["(>= 1 1 1)", bool(true)],
        ["(>= 2 2 1)", bool(true)],
        ["(>= 3 2 1)", bool(true)],
        ["(>= 2 1 2)", bool(false)],
    ])("%p", (program, expected) => {
        const expr = parse(lex(program));
        const actual = evaluate(expr);
        expect(actual).toEqual(expected);
    });
});