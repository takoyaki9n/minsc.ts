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

    test.each([
        ["(if (< 1 2) 3 4)", number(3)],
        ["(if (> 1 2) 3 4)", number(4)],
    ])("if form %p", (program, expected) => {
        const expr = parse(lex(program));
        const actual = evaluate(expr);
        expect(actual).toEqual(expected);
    });

    test("lambda expression", () => {
        const program = "((lambda (x y) (+ (* x x) (* y y))) 3 4)";
        const expr = parse(lex(program));
        const actual = evaluate(expr);
        expect(actual).toEqual(number(25));
    });

    test("let expression", () => {
        const program = 
        `(let ((fix (lambda (f)
                    ((lambda (x) (f (lambda (y) ((x x) y))))
                        (lambda (x) (f (lambda (y) ((x x) y)))))))
               (fact (lambda (f)
                    (lambda (n)
                        (if (< n 2) 1 (* n (f (- n 1))))))))
                ((fix fact) 4))`;
        const expr = parse(lex(program));
        const actual = evaluate(expr);
        expect(actual).toEqual(number(24));
    });
});