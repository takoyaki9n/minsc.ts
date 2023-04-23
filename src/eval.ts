import { evalAdd, evalDiv, evalEq, evalGe, evalGt, evalLe, evalLt, evalMul, evalSub } from "./lib/number";
import { SExpr } from "./parse";

export type VNil = ["nil"];
export type VSymbol = ["symbol", string];
export type VNumber = ["number", number];
export type VBool = ["bool", boolean];
export type VBuiltInProc = ["built-in-proc", (args: Value[]) => Value];
export type VClosure = ["closure", string[], SExpr[], Env];
export type Value =
    | VNil
    | VSymbol
    | VNumber
    | VBool
    | VBuiltInProc
    | VClosure;

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
        case "closure":
            return `<Closure (${value[1].join(", ")}>)`;
        default:
            return `Invalid value: ${value}`;
    }
};

type Frame = Record<string, Value>;
export class Env {
    private frame: Frame;
    private outer: Env | null;

    constructor(outer?: Env, frame?: Frame) {
        this.frame = frame ?? {};
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

const evalLiteral = (token: string): Value => {
    const number = Number(token);
    if (!isNaN(number)) {
        return ["number", number];
    }

    if (token === "#t" || token === "#f") {
        return ["bool", token === "#t"];
    }

    return ["symbol", token];
};

const evalAtom = (token: string, env: Env): Value => {
    const literalOrSymbol = evalLiteral(token);
    if (literalOrSymbol[0] !== "symbol") {
        return literalOrSymbol;
    }

    const value = env.lookup(literalOrSymbol[1]);
    if (value === undefined) {
        throw new Error(`Unbound variable: ${token}`);
    }

    return value;
};

const expressionToList = (expr: SExpr, list: SExpr[] = []): SExpr[] => {
    if (expr === null) {
        return list;
    } else if (typeof expr === "string") {
        throw new Error(`Expression is imcomplete list: ${expr}`);
    }

    const [car, cdr] = expr;
    list.push(car);

    return expressionToList(cdr, list);
};

const evalIf = (expr: SExpr, env: Env): Value => {
    const [testExpr, thenExpr, elseExpr, ...rest] = expressionToList(expr);
    if (rest.length > 0) {
        throw new Error(`Malformed if: ${rest}`);
    }

    const testValue = evalSExpression(testExpr, env);
    if (testValue[0] !== "bool") {
        throw new Error(`Bool is expected but got: ${displayValue(testValue)}`);
    }

    return evalSExpression(testValue[1] ? thenExpr : elseExpr, env);
};

const evalLambda = (expr: SExpr, env: Env): VClosure => {
    const [paramPart, ...body] = expressionToList(expr);
    const params = expressionToList(paramPart).reduce<string[]>((acc, param) => {
        if (typeof param === "string") {
            const value = evalLiteral(param);
            if (value[0] === "symbol") {
                acc.push(value[1]);
            }
        }

        return acc;
    }, []);

    return ["closure", params, body, env];
};

const buildFrame = (params: string[], args: SExpr[], env: Env): Frame => {
    if (params.length !== args.length) {
        throw new Error(`Invalid number of arguments: expected ${params.length} but got ${args.length}`);
    }

    return params.reduce<Frame>((frame, param, i) => {
        frame[param] = evalSExpression(args[i], env);
        return frame;
    }, {});
};

const evalClosure = (closure: VClosure, args: SExpr[], env: Env): Value => {
    const [, params, body, closureEnv] = closure;
    const frame = buildFrame(params, args, env);
    const newEnv = new Env(closureEnv, frame);

    return body.reduce<Value>((_, expr) => {
        return evalSExpression(expr, newEnv);
    }, ["nil"]);
};

const breakDownLet = (expr: SExpr): [string[], SExpr[], SExpr[]] => {
    const [bindings, ...body] = expressionToList(expr);
    const [params, args] = expressionToList(bindings).reduce<[string[], SExpr[]]>((acc, expression) => {
        const [param, arg, ...rest] = expressionToList(expression);
        if (rest.length > 0) {
            throw new Error(`Malformed let ${expr}`);
        }

        if (typeof param === "string") {
            acc[0].push(param);
            acc[1].push(arg);
        }

        return acc;
    },[[],[]]);

    return [params, args, body];
};

const evalLet = (expr: SExpr, env: Env): Value => {
    const [params, args, body] = breakDownLet(expr);
    const closure: VClosure = ["closure", params, body, env];

    return evalClosure(closure, args, env);
};

const evalApply = (car: SExpr, cdr: SExpr, env: Env): Value => {
    const value = evalSExpression(car, env);
    if (value[0] === "built-in-proc") {
        const exprs = expressionToList(cdr);
        const args = exprs.map((expr) => evalSExpression(expr, env));

        return value[1](args);
    } else if (value[0] === "closure") {
        const args = expressionToList(cdr);

        return evalClosure(value, args, env);
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
            case "lambda":
                return evalLambda(cdr, env);
            case "let":
                return evalLet(cdr, env);
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