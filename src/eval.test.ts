import { beforeEach, describe, expect, test } from "@jest/globals";
import { nil, number } from "./value";
import { bool } from "./value";
import parse from "./parse";
import lex from "./lex";
import evaluate from "./eval";
import { Env } from "./env";

describe("evaluate", () => {
    let env = new Env();
    beforeEach(() => {
        env = new Env();
        env.initialize();
    });

    test.each([
        ["()", nil()],
        ["#t", bool(true)],
        ["#f", bool(false)],
        ["0", number(0)],
        ["123", number(123)],
        ["-4.5", number(-4.5)]
    ])("literal %p", (program, expected) => {
        const expr = parse(lex(program));
        const actual = evaluate(expr, env);
        expect(actual).toEqual(expected);
    });

    test.each([
        ["(if (< 1 2) 3 4)", number(3)],
        ["(if (> 1 2) 3 4)", number(4)],
    ])("if form %p", (program, expected) => {
        const expr = parse(lex(program));
        const actual = evaluate(expr, env);
        expect(actual).toEqual(expected);
    });

    test("lambda expression", () => {
        const program = "((lambda (x y) (+ (* x x) (* y y))) 3 4)";
        const expr = parse(lex(program));
        const actual = evaluate(expr, env);
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
        const actual = evaluate(expr, env);
        expect(actual).toEqual(number(24));
    });

    test("letrec expression", () => {
        const program =
            `(letrec ((even? (lambda (n) 
                        (if (= n 0) #t (odd? (- n 1)))))
                  (odd? (lambda (n) 
                        (if (= n 0) #f (even? (- n 1)))))) 
            (even? 11))`;
        const expr = parse(lex(program));
        const actual = evaluate(expr, env);
        expect(actual).toEqual(bool(false));
    });
});