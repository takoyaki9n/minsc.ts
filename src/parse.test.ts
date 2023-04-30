import { describe, expect, test } from "@jest/globals";
import lex from "./lex";
import { nil, atom, cons, list } from "./ast";
import parse, { parseCPS } from "./parse";

describe("parse", () => {
    test("nil", () => {
        const tokens = lex("()");
        const expected = nil();
        expect(parse([...tokens])).toEqual(expected);
        expect(parseCPS([...tokens])).toEqual([[], expected]);
    });

    test("atom", () => {
        const tokens = lex("x");
        const expected = atom("x");
        expect(parse([...tokens])).toEqual(expected);
        expect(parseCPS([...tokens])).toEqual([[], expected]);
    });

    test("cons", () => {
        const tokens = lex("(() . 0)");
        const expected = cons(nil(), atom(0));
        expect(parse([...tokens])).toEqual(expected);
        expect(parseCPS([...tokens])).toEqual([[], expected]);
    });

    test("simple list", () => {
        const tokens = lex("(1 2)");
        const expected = list(atom(1), atom(2));
        expect(parseCPS([...tokens])).toEqual([[], expected]);
    });

    test("incomplete list", () => {
        const tokens = lex("(1 2 . 3)");
        const expected = cons(atom(1), cons(atom(2), atom(3)));
        expect(parseCPS([...tokens])).toEqual([[], expected]);
    });

    test("complex expression", () => {
        const tokens = lex("(let ((a 2)) (- a))");
        const expected = list(atom("let"), list(list(atom("a"), atom(2))), list(atom("-"), atom("a")));
        expect(parseCPS([...tokens])).toEqual([[], expected]);
    });

    test("multiline", () => {
        const lines = [lex("(let ((a 2))"), lex("(- a))")];
        const expected = list(atom("let"), list(list(atom("a"), atom(2))), list(atom("-"), atom("a")));
        const result0 = parseCPS(lines[0]);
        if (typeof result0 === "function") {
            expect(result0(lines[1])).toEqual([[], expected]);
        }
    });
});
