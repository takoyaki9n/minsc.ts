const DELIMITERS = /[()[\]{};"'`|]/d;
const WHITESPACE = /\s/;

const splitAtIndex = (str: string, i: number): [string, string] =>
    [str.substring(0, i), str.substring(i)];

const getNextIndex = (input: string): number => {
    const delimiter = input.match(DELIMITERS);
    if (delimiter?.index === 0) {
        return delimiter[0].length;
    }

    return Math.min(
        delimiter?.index ?? input.length,
        input.match(WHITESPACE)?.index ?? input.length
    );
};

const lex = (program: string): string[] => {
    const tokens: string[] = [];

    let rest = program.trim();
    while (rest.length > 0) {
        const index = getNextIndex(rest);
        const [token, next] = splitAtIndex(rest, index);
        tokens.push(token);
        rest = next.trimStart();
    }

    return tokens;
};

export default lex;
