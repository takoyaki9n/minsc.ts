import Tagged from "./tagged";

export type ENil = ["Nil"];
export type EAtom = Tagged<"Atom", string>;
export type ECons = Tagged<"Cons", [SExpression, SExpression]>;
export type SExpression = ENil | EAtom | ECons;

export const nil = (): ENil => ["Nil"];
export const atom = (value: unknown): EAtom => ["Atom", `${value}`];
export const cons = (car: SExpression, cdr: SExpression): ECons => ["Cons", [car, cdr]];
export const list = (...exprs: SExpression[]): SExpression =>
    exprs.reduceRight((lis, expr) => cons(expr, lis), nil());

export const toArray = (expr: SExpression, arr: SExpression[] = []): SExpression[] | null => {
    const [tag, value] = expr;
    if (tag === "Nil") {
        return arr;
    } else if (tag === "Atom") {
        return null;
    }

    const [car, cdr] = value;
    const rest = toArray(cdr);

    return rest === null ? null : [car, ...rest];
};
