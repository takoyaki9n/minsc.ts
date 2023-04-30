export const NIL = Symbol("Nil");
export const ATOM = Symbol("Atom");
export const CONS = Symbol("Cons");

export type ENil = [typeof NIL];
export type EAtom = Labeled<typeof ATOM, string>;
export type ECons = Labeled<typeof CONS, [SExpression, SExpression]>;
export type SExpression = ENil | EAtom | ECons;

export const nil = (): ENil => [NIL];
export const atom = (value: unknown): EAtom => [ATOM, `${value}`];
export const cons = (car: SExpression, cdr: SExpression): ECons => [CONS, [car, cdr]];
export const list = (...exprs: SExpression[]): SExpression =>
    exprs.reduceRight((lis, expr) => cons(expr, lis), nil());
