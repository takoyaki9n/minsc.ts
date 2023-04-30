import { SExpression, atom, cons, nil } from "./ast";

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

type ParseResult = [string[], SExpression] | Continuation;
type Continuation = (tokens: string[]) => ParseResult;
type Callback = (parseResult: ParseResult) => ParseResult;

type LeftCallback = (tokens: string[], expr: SExpression) => ParseResult;
const leftCallback = (f: LeftCallback): Callback =>
    (result) => (typeof result === "function") ? result : f(result[0], result[1]);

const parseCdrCPS = (tokens: string[], callback: Callback): ParseResult => {
    switch (tokens[0]) {
        case undefined:
            return (tokens) => parseCdrCPS(tokens, callback);
        case ".": {
            const [, ...rest] = tokens;
            return parseSExpressionCPS(rest, leftCallback((tokens, cdr) => {
                const [token, ...rest] = tokens;
                if (token !== ")") {
                    throw new Error(`Unexpected token: ${token}`);
                }

                return callback([rest, cdr]);
            }));
        }
        default:
            return parseCarCPS(tokens, callback);
    }
};


const parseCarCPS = (tokens: string[], callback: Callback): ParseResult => {
    switch (tokens[0]) {
        case undefined:
            return (tokens) => parseCarCPS(tokens, callback);
        case ")": {
            const [, ...rest] = tokens;

            return callback([rest, nil()]);
        }
        default: {
            return parseSExpressionCPS(tokens, leftCallback((tokens, car) =>
                parseCdrCPS(tokens, leftCallback((tokens, cdr) =>
                    callback([tokens, cons(car, cdr)])
                ))
            ));
        }
    }
};

const parseSExpressionCPS = (tokens: string[], callback: Callback): ParseResult => {
    const [token, ...rest] = tokens;
    switch (token) {
        case undefined:
            throw new Error("Unexpected EOF in s-expression");
        case "(":
            return parseCarCPS(rest, callback);
        case ")":
            throw new Error("Unexpected token: )");
        default:
            return callback([rest, atom(token)]);
    }
};

export const parseCPS = (tokens: string[]): ParseResult => {
    return parseSExpressionCPS(tokens, leftCallback((tokens, expr) => {
        if (tokens.length !== 0) {
            throw new Error("Redundant expression");
        }

        return [tokens, expr];
    }));
};
