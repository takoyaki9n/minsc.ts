import { execSync } from "child_process";
import { Labeled } from "./labeled";
import exp from "constants";

export const NIL = Symbol("Nil");
export const ATOM = Symbol("Atom");
export const CONS = Symbol("Cons");

export type ENil = [typeof NIL];
export type EAtom = Labeled<typeof ATOM, string>;
export type ECons = Labeled<typeof CONS, [SExpression, SExpression]>;
export type SExpression = ENil | EAtom | ECons;

export const nil = (): ENil => [NIL];
export const atom = (value: unknown): EAtom => [ATOM, `${value}`];
export const cons = (car: SExpression, cdr: SExpression): ECons => [CONS, [car, cdr]];
export const list = (...exprs: SExpression[]): SExpression =>
    exprs.reduceRight((lis, expr) => cons(expr, lis), nil());

export const displaySExpression = (expr: SExpression, isCdr = false): string => {
    const [label, value] = expr;
    if (label === NIL) {
        return isCdr ? ")" : "()";
    } else if (label === ATOM) {
        return isCdr ? `. ${value})` : value;
    }

    const [car, cdr] = value;
    const carStr = displaySExpression(car);
    const cdrStr = displaySExpression(cdr, true);
    const prefix = isCdr ? "" : "(";
    const space = cdr[0] === NIL ? "" : " ";

    return `${prefix}${carStr}${space}${cdrStr}`;
};

const parseCdr = (tokens: string[]): SExpression => {
    const token = tokens[0];
    switch (token) {
        case undefined:
            throw new Error("Unexpected EOF");
        case ".": {
            tokens.shift();
            const expr = parseSExpression(tokens);

            const tok = tokens.shift();
            if (tok !== ")") {
                throw new Error(`Unexpected token: ${tok}`);
            }

            return expr;
        } default:
            return parseCar(tokens);
    }
};

const parseCar = (tokens: string[]): SExpression => {
    const token = tokens[0];
    switch (token) {
        case undefined:
            throw new Error("Unclosed open paren");
        case ")":
            tokens.shift();
            return nil();
        default: {
            const car = parseSExpression(tokens);
            const cdr = parseCdr(tokens);
            return cons(car, cdr);
        }
    }
};

const parseSExpression = (tokens: string[]): SExpression => {
    const token = tokens.shift();
    switch (token) {
        case undefined:
            throw new Error("Unexpected EOF");
        case "(":
            return parseCar(tokens);
        case ")":
            throw new Error("Unexpected token: )");
        default:
            return atom(token);
    }
};

/**
 * S_EXPRESSION ::= "(" CAR | atom
 * CAR          ::= ")" | S_EXPRESSION CDR
 * CDR          ::= "." S_EXPRESSION ")" | CAR
 */
const parse = (tokens: string[]): SExpression => {
    const expr = parseSExpression(tokens);
    if (tokens.length == 0) {
        return expr;
    } else {
        throw new Error(`Redundant expression: ${tokens}`);
    }
};

export default parse;

type ParseResult = [string[], SExpression];
type Callback = (parseResult: ParseResult) => ParseResult;

const parseCdrCPS = (tokens: string[], callback: Callback): ParseResult => {
    switch (tokens[0]) {
        case undefined:
            throw new Error("Unexpected EOF");
        case ".": {
            const [, ...rest] = tokens;
            return parseSExpressionCPS(rest, ([tokens, expr]) => {
                const [token, ...rest] = tokens;
                if (token !== ")") {
                    throw new Error(`Unexpected token: ${token}`);
                }

                return callback([rest, expr]);
            });
        }
        default:
            return parseCarCPS(tokens, callback);
    }
};

const parseCarCPS = (tokens: string[], callback: Callback): ParseResult => {
    switch (tokens[0]) {
        case undefined:
            throw new Error("Unclosed open paren");
        case ")": {
            const [, ...rest] = tokens;

            return callback([rest, nil()]);
        }
        default: {
            return parseSExpressionCPS(tokens, ([tokens, car]) =>
                parseCdrCPS(tokens, ([tokens, cdr]) =>
                    callback([tokens, cons(car, cdr)]))
            );
        }
    }
};

const parseSExpressionCPS = (tokens: string[], callback: Callback): ParseResult => {
    const [token, ...rest] = tokens;
    switch (token) {
        case undefined:
            throw new Error("Unexpected EOF");
        case "(":
            return parseCarCPS(rest, callback);
        case ")":
            throw new Error("Unexpected token: )");
        default:
            return callback([rest, atom(token)]);
    }
};

export const parseCPS = (tokens: string[]): SExpression => {
    const [rest, expr] = parseSExpressionCPS(tokens, (result) => result);
    if (rest.length !== 0) {
        throw new Error("Redundant expression");
    }

    return expr;
};