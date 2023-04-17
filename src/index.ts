import * as readline from 'readline/promises';
import { stdin, stdout } from 'process';
import lex from './lex';

const main = async () => {
    const rl = readline.createInterface({ input: stdin, output: stdout });

    while (true) {
        const program = await rl.question("min-scheme.ts> ");

        if (program === "exit") {
            console.log("Bye.");
            break;
        }

        const tokens = lex(program);

        console.log(tokens);
    }

    rl.close();
};

main();
