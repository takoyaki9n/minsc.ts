import { Labeled } from "./labeled";

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
    const space = cdr[0] === NIL ? "" : " ";

    return isCdr ? `${carStr}${space}${cdrStr}` : `(${carStr}${space}${cdrStr}`;
};

const parseCons = (car: SExpression, tokens: string[]): SExpression => {
    const cdr = parseSExpression(tokens);
    const token = tokens.shift();
    switch (token) {
        case ")":
            return cons(car, cdr);
        case undefined:
            throw new Error("Unexpected EOF");
        default:
            throw new Error(`Unexpected token: ${token}`);
    }
};

const parseInParen = (tokens: string[]): SExpression => {
    const token = tokens[0];
    switch (token) {
        case undefined:
            throw new Error("Unclosed open paren");
        case ")":
            tokens.shift();
            return nil();
        default: {
            const car = parseSExpression(tokens);
            if (tokens[0] === ".") {
                tokens.shift();
                return parseCons(car, tokens);
            }

            const cdr = parseInParen(tokens);
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
            return parseInParen(tokens);
        case ")":
            throw new Error("Unexpected token: )");
        default:
            return atom(token);
    }
};

const parse = (tokens: string[]): SExpression => {
    const expr = parseSExpression(tokens);
    if (tokens.length == 0) {
        return expr;
    } else {
        throw new Error("Redundant expression");
    }
};

export default parse;

