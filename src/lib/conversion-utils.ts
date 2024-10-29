import type { Bit, BCD, DPD } from './types';

export function decimalToBCD(decimal: number): BCD {
    if (decimal > 999 || decimal < 0 || !Number.isInteger(decimal)) {
        throw new Error('Input must be an integer between 0 and 999.');
    }

    const decimalString = decimal.toString().padStart(3, '0');
    let bits: Bit[] = [];

    for (const char of decimalString) {
        const digit = parseInt(char, 10);
        for (let i = 3; i >= 0; i--) {
            bits.push(((digit >> i) & 1) as Bit);
        }
    }

    return bits;
}

/**
 * Converts a BCD representation to its DPD representation.
 * @param bcd - The BCD representation as an array of 12 Bits.
 * @returns The DPD representation as an array of 10 Bits.
 */
export function BCDToDPD(bcd: BCD): DPD {
    if (bcd.length !== 12) {
        throw new Error('BCD bits length must be 12.');
    }

    const bits = bcd.map(bit => bit === 1 ? true : false);
    const [a, b, c, d, e, f, g, h, i, j, k, m] = bits;

    // Compute DPD bits using boolean logic
    const p = b || (a && j) || (a && f && i);
    const q = c || (a && k) || (a && g && i);
    const r = d;
    const s = (f && (!a || !i)) || (!a && e && j) || (e && i);
    const t = g || (!a && e && k) || (a && i);
    const u = h;
    const v = a || e || i;
    const w = a || (e && i) || (!e && j);
    const x = e || (a && i) || (!a && k);
    const y = m;

    const dpdBits: DPD = [
        p ? 1 : 0,
        q ? 1 : 0,
        r ? 1 : 0,
        s ? 1 : 0,
        t ? 1 : 0,
        u ? 1 : 0,
        v ? 1 : 0,
        w ? 1 : 0,
        x ? 1 : 0,
        y ? 1 : 0,
    ];

    return dpdBits;
}

/**
 * Converts a DPD representation back to its BCD representation.
 * @param dpd - The DPD representation as an array of 10 Bits.
 * @returns The BCD representation as an array of 12 Bits.
 */
export function DPDToBCD(dpd: DPD): BCD {
    if (dpd.length !== 10) {
        throw new Error('DPD bits length must be 10.');
    }

    const bits = dpd.map(bit => bit === 1 ? true : false);
    const [p, q, r, s, t, u, v, w, x, y] = bits;

    // Compute BCD bits using boolean logic
    const a = (v && w) && (!s || t || !x);
    const b = p && (!v || !w || (s && !t && x));
    const c = q && (!v || !w || (s && !t && x));
    const d = r;
    const e = v && ((!w && x) || (!t && x) || (s && x));
    const f = (s && (v || !x)) || (p && !s && t && v && w && x);
    const g = (t && (v || !x)) || (q && !s && t && w);
    const h = u;
    const i = v && ((!w && !x) || (w && x && (s || t)));
    const j = (!v && w) || (s && v && !w && x) || (p && w && (!x || (!s && !t)));
    const k = (!v && x) || (t && !w && x) || (q && v && w && (!x || (!s && !t)));
    const m = y;

    const bcdBits: BCD = [
        a ? 1 : 0,
        b ? 1 : 0,
        c ? 1 : 0,
        d ? 1 : 0,
        e ? 1 : 0,
        f ? 1 : 0,
        g ? 1 : 0,
        h ? 1 : 0,
        i ? 1 : 0,
        j ? 1 : 0,
        k ? 1 : 0,
        m ? 1 : 0,
    ];

    return bcdBits;
}

/**
 * Converts a BCD representation to its decimal number.
 * @param bcd - The BCD representation as an array of Bits.
 * @returns The decimal number.
 */
export function BCDToDecimal(bcd: BCD): number {
    if (bcd.length % 4 !== 0) {
        throw new Error('BCD bits length must be a multiple of 4.');
    }

    let decimal = 0;
    for (let i = 0; i < bcd.length; i += 4) {
        const digitBits = bcd.slice(i, i + 4);
        let digit = 0;
        for (let j = 0; j < 4; j++) {
            digit = (digit << 1) | digitBits[j];
        }
        decimal = decimal * 10 + digit;
    }
    return decimal;
}

/**
 * Converts a DPD representation to its decimal number.
 * @param dpd - The DPD representation as an array of Bits.
 * @returns The decimal number.
 */
export function DPDToDecimal(dpd: DPD): number {
    const bcd = DPDToBCD(dpd);
    return BCDToDecimal(bcd);
}

/**
 * Converts a decimal number directly to its DPD representation.
 * @param decimal - A positive integer between 0 and 999.
 * @returns The DPD representation as an array of 10 Bits.
 */
export function decimalToDPD(decimal: number): DPD {
    // First convert decimal to BCD
    const bcd = decimalToBCD(decimal);
    // Then convert BCD to DPD
    return BCDToDPD(bcd);
}