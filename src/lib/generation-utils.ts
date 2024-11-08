import { decimalToBCD, BCDToDPD, DPDToBCD, DPDToDecimal } from "./conversion-utils";
import type { Bit, BCD, DPD, EncodedNumber } from './types';

function generateRandomNumber(): EncodedNumber {
    let custom: EncodedNumber = {
        BCDNumber: [] as BCD,
        DPDNumber: [] as DPD,
        DecimalNumber: 0
    };

    custom.DecimalNumber = getRandomInt(5,9) * 100 + getRandomInt(5,9) * 10 + getRandomInt(5,9);
    custom.BCDNumber = decimalToBCD(custom.DecimalNumber)
    custom.DPDNumber = BCDToDPD(custom.BCDNumber)
    return custom;
}

export function generateDPDQuestions(numQuestions: number): EncodedNumber[] {
    const questions: EncodedNumber[] = [];
    for (let i = 0; i < numQuestions; i++) {
        questions.push(generateRandomNumber());
    }
    return questions;
}

function getRandomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

