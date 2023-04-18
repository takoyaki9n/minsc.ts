import { evalAdd, evalDiv, evalEq, evalGe, evalGt, evalLe, evalLt, evalMul, evalSub } from "./lib/number";
import { SExpr } from "./parse";

export type VNil = ["nil"];
export type VSymbol = ["symbol", string];
export type VNumber = ["number", number];
export type VBool = ["bool", boolean];
export type VBuiltInProc = ["built-in-proc", (args: Value[]) => Value];
export type Value =
    | VNil
    | VSymbol
    | VNumber
    | VBool
    | VBuiltInProc;

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
        case "built-in-proc":
            return "<Built-In Procedure>";
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
    if (expr === null) {
        return args ?? [];
    } else if (typeof expr === "string") {
        throw new Error(`A list is expected but got: ${expr}`);
    }

    const [car, cdr] = expr;
    args.push(evalSExpression(car, env));

    return evalArgs(cdr, env, args);
};

const toList = (expr: SExpr, list: SExpr[] = []): SExpr[] => {
    if (expr === null) {
        return list;
    } else if (typeof expr === "string") {
        throw new Error(`Expression is imcomplete list: ${expr}`);
    }

    const [car, cdr] = expr;
    list.push(car);

    return toList(cdr, list);
};

const evalIf = (expr: SExpr, env: Env): Value => {
    const [testExpr, thenExpr, elseExpr, ...rest] = toList(expr);
    if (rest.length > 0) {
        throw new Error(`Malformed if: ${rest}`);
    }

    const testValue = evalSExpression(testExpr, env);
    if (testValue[0] !== "bool") {
        throw new Error(`Bool is expected but got: ${displayValue(testValue)}`);
    }

    return evalSExpression(testValue[1] ? thenExpr : elseExpr, env);
};

const evalApply = (car: SExpr, cdr: SExpr, env: Env): Value => {
    const value = evalSExpression(car, env);
    if (value[0] === "built-in-proc") {
        const args = evalArgs(cdr, env);

        return value[1](args);
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
        switch (car) {
            case "if":
                return evalIf(cdr, env);
            default:
                return evalApply(car, cdr, env);
        }
    }
};

export const initialEnv = (): Env => {
    const env = new Env();
    env.set("+", evalAdd);
    env.set("-", evalSub);
    env.set("*", evalMul);
    env.set("/", evalDiv);

    env.set("=", evalEq);
    env.set("<", evalLt);
    env.set("<=", evalLe);
    env.set(">", evalGt);
    env.set(">=", evalGe);

    return env;
};

const evaluate = (expr: SExpr): Value => {
    const env = initialEnv();

    return evalSExpression(expr, env);
};

export default evaluate;