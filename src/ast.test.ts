import { describe, expect, test } from "@jest/globals";
import { SExpression, nil, atom, cons, list, display } from "./ast";

describe("display", () => {
    test("nil", () => {
        const expr: SExpression = nil();
        expect(display(expr)).toBe("()");
    });

    test("atom", () => {
        const expr: SExpression = atom("x");
        expect(display(expr)).toBe("x");
    });

    test("cons", () => {
        const expr: SExpression = cons(nil(), atom(0));
        expect(display(expr)).toBe("(() . 0)");
    });

    test("simple list", () => {
        const expr: SExpression = list(atom(1), atom(2));
        expect(display(expr)).toBe("(1 2)");
    });

    test("incomplete list", () => {
        const expr: SExpression = cons(atom(1), cons(atom(2), atom(3)));
        expect(display(expr)).toBe("(1 2 . 3)");
    });

    test("complex expression", () => {
        const expr: SExpression = list(
            atom("let"),
            list(list(atom("a"), atom(2))),
            list(atom("-"), atom("a")),
        );
        expect(display(expr)).toBe("(let ((a 2)) (- a))");
    });
});
