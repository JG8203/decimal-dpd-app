<script lang="ts">
import { onMount } from 'svelte';
import { generateQuestions } from "$lib/generation-utils";
import type { EncodedNumber, Progress, Bit } from "$lib/types";
import { currentDate, currentTime } from "$lib/utils";
import { DPDToDecimal } from "$lib/conversion-utils";

// State declarations
let direction = $state(false);
let questions: EncodedNumber[] = $state([]);
let progress: Progress = $state({ correct: 0, incorrect: 0, currentQuestion: 0 });
let userAnswer = $state("");
let feedback = $state("");
let timer = $state(30);
let isLoaded = $state(false);
let date = $state(currentDate());
let time = $state(currentTime());

// Intervals
let timerInterval: number;

// Derived values
let displayNumber = $derived(
    isLoaded ? 
        direction ?
            questions[progress.currentQuestion]?.DPDNumber.join('') :
            questions[progress.currentQuestion]?.DecimalNumber
        : ''
);

// Timer functions
function formatTimer(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

function resetTimer() {
    timer = 30;
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

// Date and time functions
function updateDate() {
    date = currentDate();
}

function updateTime() {
    time = currentTime();
}

// Quiz navigation functions
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

// Answer handling
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

// Lifecycle
onMount(() => {
    // Initialize questions
    questions = generateQuestions(100);
    isLoaded = true;
    
    // Start timer
    startTimer();
    
    // Initialize date/time updates
    updateDate();  // Initial update
    updateTime();  // Initial update
    
    const timeInterval = setInterval(updateTime, 1000);
    const dateInterval = setInterval(updateDate, 1000 * 60 * 60 * 24);
    
    // Cleanup function
    return () => {
        clearInterval(timerInterval);
        clearInterval(timeInterval);
        clearInterval(dateInterval);
    };
});

// Auto-cleanup timer when component is destroyed
$effect(() => {
    if (isLoaded) {
        startTimer();
        return () => clearInterval(timerInterval);
    }
});
</script>

<style>
body {
    margin: 0;
    padding: 0;
    background: #FFFFFF;
    color: #000000;
    font-family: Arial, Helvetica, sans-serif;
}

.header-banner {
    background: #DCFEC5 url("/api/placeholder/800/85") repeat-x;
    border-bottom: 3px solid #FFFF00;
    padding: 0;
    height: 85px;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 100;
}

.subanner {
    background-color: #000000;
    position: fixed;
    z-index: 999;
    width: 100%;
}

.subanner-text {
    color: #FFFFFF
}

.header-title {
    background-color: rgb(150,208,70);
    font-size: 24px;
    padding: 20px;
    font-weight: bold;
}

.timer {
    float: right;
    font-family: monospace;
    background: #fff;
    padding: 2px 8px;
    border: 1px solid #029102;
    margin: 20px;
}

.sidebar {
    position: fixed;
    left: 0;
    top: 88px;
    bottom: 0;
    width: 180px;
    background: #FFFFFF;
    border-right: 1px solid #CCCCCC;
    padding: 0;
    overflow-y: auto;
}

.menu {
    padding: 5px 10px;
    background: #F5F5F5;
    border-bottom: 1px solid #CCCCCC;
    color: #000000;
    font-size: 12px;
}

.menu b {
    color: #029102;
}

.main-content {
    margin-left: 180px;
    margin-top: 88px;
    padding: 16px;
    background: #FFFFFF;
    min-height: calc(100vh - 88px);
}

.question-box {
    background: #F5F5F5;
    border: 1px solid #CCCCCC;
    padding: 15px;
    margin-bottom: 16px;
}

.number-display {
    font-size: 24px;
    font-weight: bold;
    text-align: center;
    padding: 16px;
    background: #FFFFFF;
    border: 1px solid #029102;
    margin: 8px 0;
    color: #029102;
}

.input-field {
    width: calc(100% - 16px);
    padding: 4px;
    margin: 4px 0;
    border: 1px solid #CCCCCC;
    font-family: monospace;
}

.button {
    background: #029102;
    border: 1px solid #027002;
    padding: 4px 12px;
    margin: 4px;
    cursor: pointer;
    color: #FFFFFF;
}

.button:hover {
    background: #027002;
}

.stats-table {
    width: 100%;
    border-collapse: collapse;
}

.stats-table td {
    border: 1px solid #CCCCCC;
    padding: 4px;
    text-align: center;
    background: #FFFFFF;
}

.stats-header {
    background: #DCFEC5;
    color: #029102;
    font-weight: bold;
}

.mode-toggle {
    background: #DCFEC5;
    border: 1px solid #029102;
    padding: 8px;
    margin-bottom: 8px;
}

.sidebar-section {
    background: #FFFFFF;
    border: 1px solid #CCCCCC;
    margin-bottom: 8px;
    padding: 8px;
}

.sidebar-header {
    background: #DCFEC5;
    padding: 4px;
    margin: -8px -8px 8px -8px;
    border-bottom: 1px solid #029102;
    color: #029102;
    font-weight: bold;
}

.footer {
    background: #029102;
    color: #FFFFFF;
    padding: 5px;
    text-align: center;
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    font-size: 12px;
}

.footer a {
    color: #FFFFFF;
    text-decoration: none;
}

.footer img {
    vertical-align: middle;
    margin: 0 5px;
}
</style>

<div class="header-banner">
    <div class="header-title">BCD Quiz Portal</div>
    <div class="timer">{formatTimer(timer)}</div>
</div>

<div class="sidebar">
    <div class="menu"><b>QUIZ NAVIGATION</b></div>
    <div class="menu"><a href="#">Start New Quiz</a></div>
    <div class="menu"><a href="#">View History</a></div>
    <div class="menu"><b>SETTINGS</b></div>
    <div class="menu"><a href="#">Change Mode</a></div>
    <div class="menu"><a href="#">Help</a></div>
</div>

<div class="main-content">
    <p>Today is <b>{date}</b><br>
    Current time is <b>{time}</b></p>

    <div class="question-box">
        <div class="mode-toggle">
            {#if direction}
            Mode: DPD → Decimal
            {:else}
            Mode: Decimal → DPD
            {/if}
            
            <label style="margin-left: 16px;">
                <input type="checkbox" bind:checked={direction} disabled={progress.currentQuestion > 0 ? true : false}> Toggle direction
            </label>
        </div>
        
        <div style="font-weight: bold; margin: 8px 0; color: #029102;">
            Convert this number:
        </div>
        
        <div class="number-display">
            {displayNumber}
        </div>
        
        <div style="margin-top: 8px;">
            Your answer:
            <input 
                type="text" 
                class="input-field" 
                placeholder={direction ? 'Enter Decimal' : 'Enter DPD'} 
                bind:value={userAnswer}
            >
        </div>
        
        {#if feedback}
        <div style="text-align: center; margin-top: 8px; color: {feedback.includes('Correct') ? '#029102' : '#FF0000'}">
            {feedback}
        </div>
        {/if}
        
        <div style="text-align: center; margin-top: 12px;">
            <button class="button" onclick={skipQuestion}>Skip</button>
            <button class="button" onclick={checkAnswer}>Check Answer</button>
        </div>
    </div>
    
    <div class="sidebar-section" style="margin-top: 20px;">
        <div class="sidebar-header">Statistics</div>
        <table class="stats-table">
            <thead>
                <tr>
                    <td class="stats-header">Correct</td>
                    <td class="stats-header">Incorrect</td>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>{progress.correct}</td>
                    <td>{progress.incorrect}</td>
                </tr>
                <tr>
                    <td class="stats-header" colspan="2">Progress</td>
                </tr>
                <tr>
                    <td colspan="2">
                        <label for="progress_meter">Progress</label>
                        <meter id="progress_meter" value={progress.currentQuestion + 1} min="0" max={questions.length}>
                            {progress.currentQuestion + 1} out of {questions.length}
                        </meter><br>
                        Question: {progress.currentQuestion + 1}/{questions.length}
                    </td>
                </tr>            
            </tbody>
        </table>
    </div>
</div>