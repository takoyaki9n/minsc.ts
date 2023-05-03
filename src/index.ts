import * as readline from "readline/promises";
import { stdin, stdout } from "process";
import lex from "./lex";
import parse from "./parse";
import evaluate from "./eval";
import { display as displayValue } from "./value";
import { Env } from "./env";

const main = async () => {
    const rl = readline.createInterface({ input: stdin, output: stdout });

    const env = new Env();
    env.initialize();

    while (true) {
        const program = await rl.question("minsc.ts> ");

        if (program === "exit") {
            console.log("Bye.");
            break;
        }

        try {
            const tokens = lex(program);
            const expr = parse(tokens);
            const value = evaluate(expr, env);

            console.log(displayValue(value));
        } catch (error) {
            console.error(error);
        }
    }

    rl.close();
};

main();
