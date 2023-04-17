const SYNTAX_TOKENS = ["(", ")"];

const WHITE_SPACE = /^\s+/;

const splitAtIndex = (str: string, i: number): [string, string] =>
    [str.substring(0, i), str.substring(i)];

const getToken = (input: string): [string, string] => {
    const trimmed = input.trim();

    for (const token of SYNTAX_TOKENS) {
        if (trimmed.startsWith(token)) {
            return splitAtIndex(trimmed, token.length);
        }
    }

    for (let i = 0; i < trimmed.length; i++) {
        const rest = trimmed.substring(i);
        const isEnd = WHITE_SPACE.test(rest) || SYNTAX_TOKENS.some((token) => rest.startsWith(token));
        if (isEnd) {
            return splitAtIndex(trimmed, i);
        }
    }

    return [trimmed, ''];
};

const lex = (program: string): string[] => {
    let tokens: string[] = [];

    let rest = program;
    while (rest.length > 0) {
        const [token, next] = getToken(rest);
        tokens.push(token);
        rest = next;
    }

    return tokens;
};

export default lex;