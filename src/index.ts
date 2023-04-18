import * as readline from "readline/promises";
import { stdin, stdout } from "process";
import lex from "./lex";
import parse from "./parse";
import evaluate from "./eval";

const main = async () => {
    const rl = readline.createInterface({ input: stdin, output: stdout });

    while (true) {
        const program = await rl.question("minsc.ts> ");

        if (program === "exit") {
            console.log("Bye.");
            break;
        }

        try {
            const tokens = lex(program);
            const expr = parse(tokens);
            const value = evaluate(expr);
            console.log(value);
        } catch (error) {
            console.error(error);
        }
    }

    rl.close();
};

main();
