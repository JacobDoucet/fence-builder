/**
 * rxjs Operators
 */
import { MonoTypeOperatorFunction, Observable } from "rxjs";
import { filter, map, mergeMap } from "rxjs/operators";

export function mergeFilter<T>($: Observable<any>, condition: (val: any) => boolean): MonoTypeOperatorFunction<T> {
    return mergeMap((val: T) => $.pipe(
        filter(condition),
        map(() => val)
    ));
}

/**
 * Lengths
 */

export const mToFt = 3.28084;

export function feetToMeters(ft: number): number {
    ft = ft || 0;

    return Number(ft) / mToFt;
}

export function metersToFeet(m: number): number {
    m = m || 0;

    return Number(m) * mToFt;
}

export function metersToInches(m: number) {
    const ft = metersToFeet(m);

    return Math.round(ft * 12);
}

export function decomposeInches(inches: number): { ft: number, inch: number } {
    inches = inches || 0;
    const inch = inches % 12;
    const ft = Math.floor(inches / 12);

    return { ft, inch };
}

export function reduceToInches(data: { ft: number, inch: number}): number {
    return data.ft * 12 + data.inch;
}
