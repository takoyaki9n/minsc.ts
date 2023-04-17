import * as readline from 'readline/promises';
import { stdin, stdout } from 'process';

const main = async () => {
    const rl = readline.createInterface({ input: stdin, output: stdout });
    
    while(true) {
        const answer = await rl.question('min-scheme.ts> ');

        if (answer === "exit") {
            console.log("Bye.");
            break;
        }
    
        console.log(answer);
    }
    
    rl.close();
};

main();
