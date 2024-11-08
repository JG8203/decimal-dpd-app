import type { Bit, BCD, DPD } from './types';

export function decimalToBCD(decimal: number): BCD {
  if (decimal > 999 || decimal < 0 || !Number.isInteger(decimal)) {
    throw new Error("Input must be an integer between 0 and 999.");
  }

  const decimalString = decimal.toString().padStart(3, "0");
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
    throw new Error("BCD bits length must be 12.");
  }

  const bits = bcd.map((bit) => (bit === 1 ? true : false));
  const [a, b, c, d, e, f, g, h, i, j, k, m] = bits;

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
export function DPDToBCD(dpd: number[]): BCD {
  if (dpd.length !== 10) {
    throw new Error("DPD bits length must be 10.");
  }

  const bits = dpd.map((bit) => (bit === 1 ? true : false));
  const [p, q, r, s, t, u, v, w, x, y] = bits;

  const a: Bit = (v && w && (!s || t || !x)) ? 1 : 0;
  const b: Bit = (p && (!v || !w || (s && !t && x))) ? 1 : 0;
  const c: Bit = (q && (!v || !w || (s && !t && x))) ? 1 : 0;
  const d: Bit = r ? 1 : 0;
  const e: Bit = (v && ((!w && x) || (!t && x) || (s && x))) ? 1 : 0;
  const f: Bit = ((s && (!v || !x)) || (p && !s && t && v && w && x)) ? 1 : 0;
  const g: Bit = ((t && (!v || !x)) || (q && !s && t && w)) ? 1 : 0;
  const h: Bit = u ? 1 : 0;
  const i: Bit = (v && ((!w && !x) || (w && x && (s || t)))) ? 1 : 0;
  const j: Bit = ((!v && w) || (s && v && !w && x) || (p && w && (!x || (!s && !t)))) ? 1 : 0;
  const k: Bit = ((!v && x) || (t && !w && x) || (q && v && w && (!x || (!s && !t)))) ? 1 : 0;
  const m: Bit = y ? 1 : 0;

  return [a, b, c, d, e, f, g, h, i, j, k, m];
}

/**
 * Converts a BCD representation to its decimal number.
 * @param bcd - The BCD representation as an array of Bits.
 * @returns The decimal number.
 */
export function BCDToDecimal(bcd: number[]): number {
  if (bcd.length % 4 !== 0) {
    throw new Error("BCD bits length must be a multiple of 4.");
  }

  let decimal = 0;
  for (let i = 0; i < bcd.length; i += 4) {
    const digitBits = bcd.slice(i, i + 4);
    let digit = 0;

    for (let j = 0; j < 4; j++) {
      digit |= digitBits[j] << (3 - j);
    }

    if (digit > 9) {
      throw new Error(`Invalid BCD digit: ${digit}`);
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
  const bcd = decimalToBCD(decimal);
  return BCDToDPD(bcd);
}

/**
 * Encodes a decimal number into the decimal32 format.
 * @param numberStr - The decimal number to encode as a string.
 * @returns The encoded decimal32 value as a Uint8Array (4 bytes).
 */
export function encodeDecimal32(numberStr: string): Uint8Array {
  let signBit: Bit;
  if (numberStr.startsWith("-")) {
    signBit = 1;
    numberStr = numberStr.substring(1);
  } else if (numberStr.startsWith("+")) {
    signBit = 0;
    numberStr = numberStr.substring(1);
  } else {
    signBit = 0;
  }

  let numStr = numberStr;
  let exponent = 0;

  const scientificMatch = numStr.match(/^(\d+(?:\.\d+)?)[eE]([-+]?\d+)$/);
  if (scientificMatch) {
    exponent = parseInt(scientificMatch[2], 10);
    numStr = scientificMatch[1];
  }

  if (numStr.includes(".")) {
    const [integerPart, fractionalPart] = numStr.split(".");
    exponent -= fractionalPart.length;
    numStr = integerPart + fractionalPart;
  }

  numStr = numStr.replace(/^0+/, "");
  if (numStr.length === 0) numStr = "0";

  while (numStr.length < 7) numStr = "0" + numStr;
  if (numStr.length > 7) numStr = numStr.slice(0, 7);

  const bias = 101;
  exponent += bias;

  if (exponent < 0 || exponent > 191)
    throw new Error("Encoded exponent out of range for decimal32.");
  const encodedExponentBits = exponent.toString(2).padStart(8, "0");

  const MSD = parseInt(numStr.charAt(0), 10);
  const MSD_bin = MSD.toString(2).padStart(4, "0");

  let combinationFieldBits = "";
  let exponentContinuationBits = "";
  if (MSD >= 0 && MSD <= 7) {
    const a = encodedExponentBits.charAt(0);
    const b = encodedExponentBits.charAt(1);
    const c = MSD_bin.charAt(1);
    const d = MSD_bin.charAt(2);
    const e = MSD_bin.charAt(3);
    combinationFieldBits = a + b + c + d + e;
    exponentContinuationBits = encodedExponentBits.slice(2);
  } else if (MSD === 8 || MSD === 9) {
    const a = "1";
    const b = "1";
    const c = encodedExponentBits.charAt(0);
    const d = encodedExponentBits.charAt(1);
    const e = MSD_bin.charAt(3);
    combinationFieldBits = a + b + c + d + e;
    exponentContinuationBits = encodedExponentBits.slice(2);
  } else {
    throw new Error("Invalid most significant digit.");
  }

  exponentContinuationBits = encodedExponentBits.slice(2);

  let coefficientContinuationDigits = numStr.slice(1);
  while (coefficientContinuationDigits.length < 6)
    coefficientContinuationDigits += "0";

  const group1Digits = parseInt(coefficientContinuationDigits.slice(0, 3), 10);
  const group2Digits = parseInt(coefficientContinuationDigits.slice(3, 6), 10);

  const dpdGroup1 = decimalToDPD(group1Digits);
  const dpdGroup2 = decimalToDPD(group2Digits);

  const totalBitsArray: Bit[] = [];

  totalBitsArray.push(signBit);

  for (const bit of combinationFieldBits)
    totalBitsArray.push(bit === "1" ? 1 : 0);

  for (const bit of exponentContinuationBits)
    totalBitsArray.push(bit === "1" ? 1 : 0);

  totalBitsArray.push(...dpdGroup1);
  totalBitsArray.push(...dpdGroup2);

  const byteArray = new Uint8Array(4);
  for (let i = 0; i < 4; i++) {
    const byteBits = totalBitsArray.slice(i * 8, (i + 1) * 8);
    let byteValue = 0;
    for (let j = 0; j < 8; j++) {
      byteValue = (byteValue << 1) | byteBits[j];
    }
    byteArray[i] = byteValue;
  }

  return byteArray;
}

/**
 * Decodes a decimal32 encoded binary string to its decimal number.
 * @param binaryStr - The binary string (32 bits).
 * @returns The decoded decimal number as a string.
 */
export function decodeDecimal32(binaryStr: string): string {
  if (binaryStr.length !== 32) {
    throw new Error('Input binary string must be 32 bits long.');
  }

  const bits: Bit[] = binaryStr.split('').map(bit => (bit === '1' ? 1 : 0));

  const signBit = bits[0];
  const combinationFieldBits = bits.slice(1, 6);
  const exponentContinuationBits = bits.slice(6, 12);
  const coefficientContinuationBits = bits.slice(12);

  const sign = signBit === 0 ? '' : '-';
  
  const [a, b, c, d, e] = combinationFieldBits;

  let exponentMSBs: Bit[] = [];
  let MSD_bits: Bit[] = [];

  if (!(a === 1 && b === 1)) {
    exponentMSBs = [a, b];
    MSD_bits = [0, c, d, e];
  } else {
    exponentMSBs = [c, d];
    MSD_bits = [1, 0, 0, e];
  }

  const MSD = parseInt(MSD_bits.map(bit => bit.toString()).join(''), 2);
  if (MSD > 9) throw new Error('Invalid MSD value decoded.');

  const exponentBits = [...exponentMSBs, ...exponentContinuationBits];
  const encodedExponent = parseInt(exponentBits.map(bit => bit.toString()).join(''), 2);
  const bias = 101;
  const exponent = encodedExponent - bias;

  const dpdGroup1Bits = coefficientContinuationBits.slice(0, 10);
  const dpdGroup2Bits = coefficientContinuationBits.slice(10, 20);

  const group1Digits = DPDToDecimal(dpdGroup1Bits).toString().padStart(3, '0');
  const group2Digits = DPDToDecimal(dpdGroup2Bits).toString().padStart(3, '0');

  const coefficientDigits = `${MSD}${group1Digits}${group2Digits}`;
  const coefficient = parseInt(coefficientDigits, 10);

  const decimalNumber = `${sign}${coefficient}e${exponent}`;

  return decimalNumber;
}
