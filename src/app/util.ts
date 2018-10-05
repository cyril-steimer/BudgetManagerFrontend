export function newFilledArray<T>(size: number, val: T): T[] {
    let res = [];
    for (let i = 0; i < size; i++) {
        res.push(val);
    }
    return res;
}

export function range(from: number, to: number): number[] {
    let res = [];
    for (let c = from; c < to; c++) {
        res.push(c);
    }
    return res;
}
