import { SExpression, display as displaySExpression, toList } from "./ast";
import { evalAdd, evalDiv, evalEq, evalGe, evalGt, evalLe, evalLt, evalMul, evalSub } from "./lib/number";
import { bool, closure, display as displayValue, nil, number, symbol, Value, VClosure } from "./value";

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
        this.frame = {
            ...this.frame,
            name: value,
        };
    }
}

const expectList = (expr: SExpression): SExpression[] => {
    const list = toList(expr);
    if (list === null) {
        throw new Error(`List is expected but got: ${displaySExpression(expr)}`);
    }

    return list;
};

const evalLiteral = (token: string): Value => {
    const num = Number(token);
    if (!isNaN(num)) {
        return number(num);
    }

    if (token === "#t" || token === "#f") {
        return bool(token === "#t");
    }

    return symbol(token);
};

const evalAtom = (token: string, env: Env): Value => {
    const literalOrSymbol = evalLiteral(token);
    if (literalOrSymbol[0] !== "Symbol") {
        return literalOrSymbol;
    }

    const value = env.lookup(literalOrSymbol[1]);
    if (value === undefined) {
        throw new Error(`Unbound variable: ${token}`);
    }

    return value;
};

const evalIf = (expr: SExpression, env: Env): Value => {
    const [, condExpr, thenExpr, elseExpr, ...rest] = expectList(expr);
    if (rest.length > 0) {
        throw new Error(`Malformed if: ${displaySExpression(expr)}`);
    }

    const condValue = evalSExpression(condExpr, env);
    if (condValue[0] !== "Bool") {
        throw new Error(`Bool is expected but got: ${displayValue(condValue)}`);
    }

    return evalSExpression(condValue[1] ? thenExpr : elseExpr, env);
};

const evalLambda = (expr: SExpression, env: Env): VClosure => {
    const [, paramPart, ...body] = expectList(expr);
    const params = expectList(paramPart).reduce<string[]>((acc, param) => {
        if (param[0] === "Atom") {
            const value = evalLiteral(param[1]);
            if (value[0] === "Symbol") {
                return [...acc, value[1]];
            }
        }

        return acc;
    }, []);

    return closure(params, body, env);
};

const buildFrame = (params: string[], args: SExpression[], env: Env): Frame => {
    if (params.length !== args.length) {
        throw new Error(`Invalid number of arguments: expected ${params.length} but got ${args.length}`);
    }

    return params.reduce<Frame>((frame, param, i) => ({
        ...frame,
        [param]: evalSExpression(args[i], env)
    }), {});
};

const evalClosure = (closure: VClosure, args: SExpression[], env: Env): Value => {
    const [params, body, closureEnv] = closure[1];
    const frame = buildFrame(params, args, env);
    const newEnv = new Env(closureEnv, frame);

    return body.reduce<Value>((_, expr) => evalSExpression(expr, newEnv), nil());
};

const breakDownLet = (expr: SExpression): [string[], SExpression[], SExpression[]] => {
    const [, bindings, ...body] = expectList(expr);
    const [params, args] = expectList(bindings).reduce<[string[], SExpression[]]>((acc, expression) => {
        const [param, arg, ...rest] = expectList(expression);
        if (rest.length > 0) {
            throw new Error(`Malformed let ${displaySExpression(expr)}`);
        }

        if (typeof param === "string") {
            return [
                [...acc[0], param],
                [...acc[1], arg],
            ];
        }

        return acc;
    }, [[], []]);

    return [params, args, body];
};

const evalLet = (expr: SExpression, env: Env): Value => {
    const [params, args, body] = breakDownLet(expr);
    const clos: VClosure = closure(params, body, env);

    return evalClosure(clos, args, env);
};

const evalApply = (car: SExpression, cdr: SExpression, env: Env): Value => {
    const value = evalSExpression(car, env);
    if (value[0] === "Built-in-proc") {
        const exprs = expectList(cdr);
        const args = exprs.map((expr) => evalSExpression(expr, env));

        return value[1](args);
    } else if (value[0] === "Closure") {
        const args = expectList(cdr);

        return evalClosure(value, args, env);
    }

    throw new Error(`Invalid application: ${displayValue(value)}`);
};

const evalSExpression = (expr: SExpression, env: Env): Value => {
    if (expr[0] === "Nil") {
        return nil();
    } else if (expr[0] === "Atom") {
        return evalAtom(expr[1], env);
    }

    const [car, cdr] = expr[1];
    if (car[0] === "Atom") {
        switch (car[1]) {
            case "if":
                return evalIf(expr, env);
            case "lambda":
                return evalLambda(expr, env);
            case "let":
                return evalLet(expr, env);
        }
    }

    return evalApply(car, cdr, env);
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

const evaluate = (expr: SExpression): Value => {
    const env = initialEnv();

    return evalSExpression(expr, env);
};

export default evaluate;