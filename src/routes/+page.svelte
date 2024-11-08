<script lang="ts">
import { onMount } from 'svelte';
import { generateDPDQuestions } from "$lib/generation-utils";
import type { EncodedNumber, Progress, Bit } from "$lib/types";
import { currentDate, currentTime } from "$lib/utils";
import { DPDToDecimal } from "$lib/conversion-utils";

let direction = $state(false);
let questions: EncodedNumber[] = $state([]);
let progress: Progress = $state({ correct: 0, incorrect: 0, currentQuestion: 0 });
let userAnswer = $state("");
let feedback = $state("");
let timer = $state(120);
let isLoaded = $state(false);
let date = $state(currentDate());
let time = $state(currentTime());

let timerInterval: number;

let displayNumber = $derived(
    isLoaded ? 
        direction ?
            questions[progress.currentQuestion]?.DPDNumber.join('') :
            questions[progress.currentQuestion]?.DecimalNumber
        : ''
);

function formatTimer(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

function resetTimer() {
    timer = 120;
}

function startTimer() {
    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        if (timer > 0) {
            timer--;
        } else {
            skipQuestion();
        }
    }, 1000);
}

function updateDate() {
    date = currentDate();
}

function updateTime() {
    time = currentTime();
}

function skipQuestion() {
    if (progress.currentQuestion < questions.length - 1) {
        progress.currentQuestion += 1;
        progress.incorrect += 1;
        userAnswer = "";
        feedback = "";
        resetTimer();
    } else {
        handleQuizCompletion();
    }
}

function nextQuestion() {
    if (progress.currentQuestion < questions.length - 1) {
        progress.currentQuestion += 1;
        userAnswer = "";
        feedback = "";
        resetTimer();
    } else {
        handleQuizCompletion();
    }
}

function checkAnswer() {
    const currentQ = questions[progress.currentQuestion];
    let isCorrect = false;

    if (direction) {
        const expectedDecimal = DPDToDecimal(currentQ.DPDNumber);
        const userDecimal = parseInt(userAnswer);
        isCorrect = !isNaN(userDecimal) && userDecimal === expectedDecimal;
    } else {
        const userDPDBits = userAnswer.split('').map(bit => parseInt(bit) as Bit);
        const isValidInput = userAnswer.length === 10 && userDPDBits.every(bit => bit === 0 || bit === 1);

        if (isValidInput) {
            isCorrect = JSON.stringify(userDPDBits) === JSON.stringify(currentQ.DPDNumber);
        } 
    }

    if (isCorrect) {
        feedback = "Correct!";
        progress.correct += 1;
        setTimeout(nextQuestion, 1000);
    } else {
        feedback = "Incorrect. Try again or skip.";
        progress.incorrect += 1;
    }
}

function handleQuizCompletion() {
    clearInterval(timerInterval);
    feedback = `Quiz completed! You got ${progress.correct} out of ${questions.length} correct.`;
}

onMount(() => {
    questions = generateDPDQuestions(10);
    isLoaded = true;
    
    startTimer();
    
    updateDate();
    updateTime();
    
    const timeInterval = setInterval(updateTime, 1000);
    const dateInterval = setInterval(updateDate, 1000 * 60 * 60 * 24);
    
    return () => {
        clearInterval(timerInterval);
        clearInterval(timeInterval);
        clearInterval(dateInterval);
    };
});

$effect(() => {
    if (isLoaded) {
        startTimer();
        return () => clearInterval(timerInterval);
    }
});
</script>
<style>
    body {
        background: #EFEFEF;
        color: #000000;
        font-family: "MS PGothic", sans-serif;
        margin: 0;
        padding: 10px;
    }

    .quiz-container {
        width: 800px;
        margin: 0 auto;
        background: #FFFFFF;
        border: 2px solid #666666;
    }

    .header-banner {
        background: #006699;
        color: #FFFFFF;
        padding: 5px;
        font-weight: bold;
        font-size: 16px;
        border-bottom: 2px solid #003366;
    }

    .info-box {
        background: #FFEFEF;
        border: 1px solid #FF9999;
        padding: 8px;
        margin: 5px;
    }

    .question-box {
        background: #E6FFE6;
        border: 1px solid #66CC66;
        padding: 10px;
        margin: 5px;
    }

    .number-display {
        font-size: 24px;
        font-weight: bold;
        color: #CC0000;
        background: #FFFFCC;
        padding: 10px;
        text-align: center;
        margin: 10px 0;
    }

    input[type="text"] {
        width: 200px;
        padding: 5px;
        border: 1px solid #999999;
    }

    .button {
        background: linear-gradient(to bottom, #FFFFFF, #CCCCCC);
        border: 1px solid #999999;
        padding: 3px 10px;
        margin: 5px;
        cursor: pointer;
    }

    .stats-table {
        width: 100%;
        border-collapse: collapse;
        margin: 10px 0;
    }

    .stats-table td, .stats-table th {
        border: 1px solid #999999;
        padding: 5px;
        background: #FFFFFF;
    }

    .stats-table th {
        background: #EEEEFF;
    }

    .timer {
        font-size: 18px;
        color: #CC0000;
        font-weight: bold;
        text-align: center;
        margin: 10px;
    }

    .feedback-correct {
        color: #009900;
        font-weight: bold;
    }

    .feedback-incorrect {
        color: #CC0000;
        font-weight: bold;
    }

    meter {
        width: 100%;
        height: 20px;
    }
</style>

<div class="quiz-container">
    <div class="header-banner">
        ◆ Number Conversion Quiz System ◆
    </div>

    <div class="info-box">
        ■ Current Date and Time: <b>{date}</b> ({time})
    </div>

    <div class="info-box">
        ▼ Mode Selection:
        {#if direction}
        【DPD → Decimal】
        {:else}
        【Decimal → DPD】
        {/if}
        <label>
            <input type="checkbox" bind:checked={direction} disabled={progress.currentQuestion > 0}> 
            Toggle Conversion Direction
        </label>
    </div>

    <div class="question-box">
        ▼ Question {progress.currentQuestion + 1}:
        <div class="number-display">
            {displayNumber}
        </div>

        <div>
            ▼ Answer Field:
            <input type="text" 
                placeholder={direction ? 'Enter Decimal' : 'Enter DPD Code'} 
                bind:value={userAnswer}>
        </div>

        {#if feedback}
        <div class={feedback === "Correct!" ? "feedback-correct" : "feedback-incorrect"}>
            {feedback === "Correct!" ? "○ Correct!" : "× Incorrect. Try again or skip."}
        </div>
        {/if}

        <div>
            <button class="button" onclick={skipQuestion}>≫ Skip</button>
            <button class="button" onclick={checkAnswer}>▶ Check Answer</button>
        </div>
    </div>

    <div class="info-box">
        ■ Statistics
        <table class="stats-table">
            <thead>
            <tr>
                <th>Correct</th>
                <th>Incorrect</th>
            </tr>
            </thead>
            <tbody>
            <tr>
                <td align="center">{progress.correct}</td>
                <td align="center">{progress.incorrect}</td>
            </tr>
            <tr>
                <th colspan="2">Progress</th>
            </tr>
            <tr>
                <td colspan="2">
                    <meter value={progress.currentQuestion + 1} min="0" max={questions.length}>
                        {progress.currentQuestion + 1}/{questions.length}
                    </meter>
                    <div style="text-align: center;">
                        {progress.currentQuestion + 1}/{questions.length} questions
                    </div>
                </td>
            </tr>
        </tbody>
        </table>
    </div>

    <div class="timer">
        ⏱ Remaining Time: {formatTimer(timer)}
    </div>
</div>
