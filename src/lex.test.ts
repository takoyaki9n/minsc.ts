import { describe, expect, test } from "@jest/globals";
import lex from "./lex";

describe("lex", () => {
    test.each([
        "(if (< 1 23) 4 (+ 5 6))",
        " (if (< 1 23) 4 (+ 5 6)) ",
        "(if (< 1 23) \n\t4\n    (+ 5 6))",
        "(if(< 1 23)4(+ 5 6))",
    ])("%p", (program) => {
        const tokens = lex(program);
        const expected = ["(", "if", "(", "<", "1", "23", ")", "4", "(", "+", "5", "6", ")", ")"];
        expect(tokens).toEqual(expected);
    });

    test("delimiters", () => {
        const tokens = lex("()[]{};\"'`|");
        const expected = ["(", ")", "[", "]", "{", "}", ";", "\"", "'", "`", "|"];
        expect(tokens).toEqual(expected);
    });
});