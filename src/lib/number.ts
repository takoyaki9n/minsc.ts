import { Value, VBuiltInProc, VNumber, VBool, display, number, builtInProc, bool } from "../value";

const mapToNumbers = (args: Value[]): number[] =>
    args.map((arg) => {
        if (arg[0] !== "Number") {
            throw new Error(`Number is expected but got: ${display(arg)}`);
        }

        return arg[1];
    });

const getCalcArithmeticOperation = (
    name: string,
    reducer: (acc: number, num: number) => number,
    unitOrUniop: number | ((num: number) => number)
): ((numbers: number[]) => number) => {
    if (typeof unitOrUniop === "number") {
        return (numbers) => numbers.reduce(reducer, unitOrUniop);
    } else {
        return (numbers) => {
            const [first, ...rest] = numbers;
            if (first === undefined) {
                throw new Error(`At least one argument is expected: ${name}`);
            }

            return rest.length == 0 ? unitOrUniop(first) : rest.reduce(reducer, first);
        };
    }
};

const getEvalArithmeticOperation = (
    name: string,
    reducer: (acc: number, num: number) => number,
    unitOrUniop: number | ((num: number) => number)
): VBuiltInProc => {
    const calculator = getCalcArithmeticOperation(name, reducer, unitOrUniop);
    const evaluator = (args: Value[]): VNumber => {
        const numbers = mapToNumbers(args);

        return number(calculator(numbers));
    };

    return builtInProc(evaluator);
};

export const evalAdd = getEvalArithmeticOperation("+", (acc, num) => acc + num, 0.0);
export const evalSub = getEvalArithmeticOperation("-", (acc, num) => acc - num, (num) => -num);
export const evalMul = getEvalArithmeticOperation("*", (acc, num) => acc * num, 1.0);
export const evalDiv = getEvalArithmeticOperation("/", (acc, num) => acc / num, (num) => 1.0 / num);

const getEvalNumericComparison = (name: string, cmp: (a: number, b: number) => boolean): VBuiltInProc => {
    const comparator = (args: Value[]): VBool => {
        const numbers = mapToNumbers(args);
        if (numbers.length < 2) {
            throw new Error(`At least two arguments are expected: ${name}`);
        }

        for (let i = 0; i < numbers.length - 1; i++) {
            if (!cmp(numbers[i], numbers[i+1])) {
                return bool(false);
            }
        }
        
        return bool(true);        
    };

    return builtInProc(comparator);
};

export const evalEq = getEvalNumericComparison("=", (a, b) => a === b);
export const evalLt = getEvalNumericComparison("<", (a, b) => a < b);
export const evalLe = getEvalNumericComparison("<=", (a, b) => a <= b);
export const evalGt = getEvalNumericComparison(">", (a, b) => a > b);
export const evalGe = getEvalNumericComparison(">=", (a, b) => a >= b); 
