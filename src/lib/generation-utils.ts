import { decimalToBCD, BCDToDPD, DPDToBCD, DPDToDecimal } from "./conversion-utils";
import type { Bit, BCD, DPD, EncodedNumber } from './types';

function generateRandomNumber(): EncodedNumber {
    let custom: EncodedNumber = {
        BCDNumber: [] as BCD,
        DPDNumber: [] as DPD,
        DecimalNumber: 0
    };

    custom.DecimalNumber = Math.floor(Math.random() * (999 - 0 + 1) + 0);
    custom.BCDNumber = decimalToBCD(custom.DecimalNumber)
    custom.DPDNumber = BCDToDPD(custom.BCDNumber)
    return custom;
}

export function generateQuestions(numQuestions: number): EncodedNumber[] {
    const questions: EncodedNumber[] = [];
    for (let i = 0; i < numQuestions; i++) {
        questions.push(generateRandomNumber());
    }
    console.log("I was run!")
    console.log(questions)
    return questions;
}