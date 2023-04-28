import { describe, expect, test } from "@jest/globals";
import parse, { SExpression, atom, cons, displaySExpression, list, nil, parseCPS } from "./parse";
import lex from "./lex";

describe("displaySExpr", () => {
    test("nil", () => {
        const expr: SExpression = nil();
        expect(displaySExpression(expr)).toBe("()");
    });

    test("atom", () => {
        const expr: SExpression = atom("x");
        expect(displaySExpression(expr)).toBe("x");
    });

    test("cons", () => {
        const expr: SExpression = cons(nil(), atom(0));
        expect(displaySExpression(expr)).toBe("(() . 0)");
    });

    test("simple list", () => {
        const expr: SExpression = list(atom(1), atom(2));
        expect(displaySExpression(expr)).toBe("(1 2)");
    });

    test("incomplete list", () => {
        const expr: SExpression = cons(atom(1), cons(atom(2), atom(3)));
        expect(displaySExpression(expr)).toBe("(1 2 . 3)");
    });

    test("complex expression", () => {
        const expr: SExpression = list(
            atom("let"),
            list(list(atom("a"), atom(2))),
            list(atom("-"), atom("a")),
        );
        expect(displaySExpression(expr)).toBe("(let ((a 2)) (- a))");
    });
});

describe("parse", () => {
    test("nil", () => {
        const tokens = lex("()");
        const expected = nil();
        expect(parse([...tokens])).toEqual(expected);
        expect(parseCPS([...tokens])).toEqual(expected);
    });

    test("atom", () => {
        const tokens = lex("x");
        const expected = atom("x");
        expect(parse([...tokens])).toEqual(expected);
        expect(parseCPS([...tokens])).toEqual(expected);
    });

    test("cons", () => {
        const tokens = lex("(() . 0)");
        const expected = cons(nil(), atom(0));
        expect(parse([...tokens])).toEqual(expected);
        expect(parseCPS([...tokens])).toEqual(expected);
    });

    test("simple list", () => {
        const tokens = lex("(1 2)");
        const expected = list(atom(1), atom(2));
        expect(parse(tokens)).toEqual(expected);
    });

    test("incomplete list", () => {
        const tokens = lex("(1 2 . 3)");
        const expected = cons(atom(1), cons(atom(2), atom(3)));
        expect(parse(tokens)).toEqual(expected);
    });

    test("complex expression", () => {
        const tokens = lex("(let ((a 2)) (- a))");
        const expected = list(
            atom("let"),
            list(list(atom("a"), atom(2))),
            list(atom("-"), atom("a")),
        );
        expect(parse(tokens)).toEqual(expected);
    });
});
