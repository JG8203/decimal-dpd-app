export type Bit = 0 | 1;
export type BCD = Bit[];
export type DPD = Bit[];

export type EncodedNumber = {
    BCDNumber: BCD
    DPDNumber: DPD
    DecimalNumber: number
}

export type Progress = {
    correct: number
    incorrect: number
    currentQuestion: number
}