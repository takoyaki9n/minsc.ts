import { evalAdd, evalSub, evalMul, evalDiv, evalEq, evalLt, evalLe, evalGt, evalGe } from "./lib/number";
import { Value } from "./value";

export type Frame = Record<string, Value>;

export class Env {
    private frame: Frame;
    private outer: Env | null;

    constructor(outer?: Env, frame?: Frame) {
        this.frame = frame ?? {};
        this.outer = outer ?? null;
    }

    public initialize(): void {
        this.set("+", evalAdd);
        this.set("-", evalSub);
        this.set("*", evalMul);
        this.set("/", evalDiv);
    
        this.set("=", evalEq);
        this.set("<", evalLt);
        this.set("<=", evalLe);
        this.set(">", evalGt);
        this.set(">=", evalGe);    
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
            [name]: value,
        };
    }

    public setFrame(frame: Frame): void {
        this.frame = frame;
    }
}
