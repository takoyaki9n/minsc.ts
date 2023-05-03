import { SExpression } from "./ast";
import { Env } from "./env";
import Tagged from "./tagged";

export type VNil = ["Nil"];
export type VSymbol = Tagged<"Symbol", string>;
export type VNumber = Tagged<"Number", number>;
export type VBool = Tagged<"Bool", boolean>;
export type VBuiltInProc = Tagged<"Built-in-proc", (args: Value[]) => Value>;
export type VClosure = Tagged<"Closure", [string[], SExpression[], Env]>;
export type Value =
    | VNil
    | VSymbol
    | VNumber
    | VBool
    | VBuiltInProc
    | VClosure;

export const nil = (): VNil => ["Nil"];
export const symbol = (value: VSymbol[1]): VSymbol => ["Symbol", value];
export const number = (value: VNumber[1]): VNumber => ["Number", value];
export const bool = (value: VBool[1]): VBool => ["Bool", value];
export const builtInProc = (value: VBuiltInProc[1]): VBuiltInProc => ["Built-in-proc", value];
export const closure = (params: string[], body: SExpression[], env: Env): VClosure => ["Closure", [params, body, env]];

export const display = (value: Value): string => {
    switch (value[0]) {
        case "Nil":
            return "Nil";
        case "Symbol":
            return value[1];
        case "Number":
            return `${value[1]}`;
        case "Bool":
            return value[1] ? "#t" : "#f";
        case "Built-in-proc":
            return "<Built-In Procedure>";
        case "Closure":
            return `<Closure (${value[1].join(", ")}>)`;
        default:
            return `Invalid value: ${value}`;
    }
};
