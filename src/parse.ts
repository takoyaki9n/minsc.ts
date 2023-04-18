export type SExpr = null | string | [SExpr, SExpr];

const parseList = (tokens: string[]): SExpr => {
    const token = tokens[0];
    switch (token) {
        case undefined:
            throw new Error("Unclosed open paren");
        case ")":
            tokens.shift();
            return null;
        default:
            const car = parseSExpression(tokens);
            const cdr = parseList(tokens);
            return [car, cdr];
    }
};

const parseSExpression = (tokens: string[]): SExpr => {
    const token = tokens.shift();
    switch (token) {
        case undefined:
            throw new Error("Unexpected EOF");
        case "(":
            return parseList(tokens);
        case ")":
            throw new Error("Unexpected token: )");
        default:
            return token;
    }
};

const parse = (tokens: string[]): SExpr => {
    let expr = parseSExpression(tokens);
    if (tokens.length == 0) {
        return expr;
    } else {
        throw new Error("Redundant expression");
    }
};

export default parse;