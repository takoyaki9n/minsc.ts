import { SExpr } from "./parse";

type VNil = ["nil"];
type VSymbol = ["symbol", string];
type VNumber = ["number", number];
type VBool = ["bool", boolean];
type VBuiltInFunc = ["built-in-func", (expr: SExpr, env: Env) => Value];
export type Value =
    | VNil
    | VSymbol
    | VNumber
    | VBool
    | VBuiltInFunc;

export const displayValue = (value: Value): string => {
    switch (value[0]) {
        case "nil":
            return "Nil";
        case "symbol":
            return value[1];
        case "number":
            return `${value[1]}`;
        case "bool":
            return value[1] ? "#t" : "#f";
        case "built-in-func":
            return "<BuiltInFunction>";
        default:
            return `Invalid value: ${value}`;
    }
};

export class Env {
    private frame: Record<string, Value>;
    private outer: Env | null;

    constructor(outer?: Env) {
        this.frame = {};
        this.outer = outer ?? null;
    }

    public isTop(): boolean {
        return !this.outer;
    }

    public lookup(name: string): Value | undefined {
        return this.frame[name] ?? this.outer?.lookup(name);
    }

    public set(name: string, value: Value): void {
        this.frame[name] = value;
    }
}

const evalAtom = (token: string, env: Env): Value => {
    const number = Number(token);
    if (!isNaN(number)) {
        return ["number", number];
    }

    if (token === "#t" || token === "#f") {
        return ["bool", token === "#t"];
    }

    const value = env.lookup(token);
    if (value === undefined) {
        throw new Error(`Unbound variable: ${token}`);
    }

    return value;
};

const evalArgs = (expr: SExpr, env: Env, args: Value[] = []): Value[] => {
    if (typeof expr === "string") {
        throw new Error(`A list is expected but got: ${expr}`);
    } else if (expr === null) {
        return args ?? [];
    } else {
        const [car, cdr] = expr;
        args.push(evalSExpression(car, env));

        return evalArgs(cdr, env, args);
    }
};

const evalApply = (car: SExpr, cdr: SExpr, env: Env): Value => {
    const value = evalSExpression(car, env);
    if (value[0] === "built-in-func") {
        return value[1](cdr, env);
    }

    throw new Error(`Invalid application: ${displayValue(value)}`);
};

const evalSExpression = (expr: SExpr, env: Env): Value => {
    if (expr === null) {
        return ["nil"];
    } else if (typeof expr === "string") {
        return evalAtom(expr, env);
    } else {
        const [car, cdr] = expr;
        if (car === "if") {
            throw new Error("Not yet implemented: if");
        } else {
            return evalApply(car, cdr, env);
        }
    }

};

const mapToNumbers = (args: Value[]): number[] =>
    args.map((arg) => {
        if (arg[0] !== "number") {
            throw new Error(`Number is expected but got: ${displayValue(arg)}`);
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
): VBuiltInFunc => {
    const calculator = getCalcArithmeticOperation(name, reducer, unitOrUniop);
    const evaluator = (expr: SExpr, env: Env): VNumber => {
        const args = evalArgs(expr, env);
        const numbers = mapToNumbers(args);

        return ["number", calculator(numbers)];
    };
 
    return ["built-in-func", evaluator];
};

const evalAdd = getEvalArithmeticOperation("+", (acc, num) => acc + num, 0.0);
const evalSub = getEvalArithmeticOperation("-", (acc, num) => acc - num, (num) => -num);
const evalMul = getEvalArithmeticOperation("*", (acc, num) => acc * num, 1.0);
const evalDiv = getEvalArithmeticOperation("/", (acc, num) => acc / num, (num) => 1.0 / num);

export const initialEnv = (): Env => {
    const env = new Env();
    env.set("+", evalAdd);
    env.set("-", evalSub);
    env.set("*", evalMul);
    env.set("/", evalDiv);

    return env;
};


const evaluate = (expr: SExpr): Value => {
    const env = initialEnv();

    return evalSExpression(expr, env);
};

export default evaluate;