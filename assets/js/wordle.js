const row1all = document.querySelector(".row-1");
const row2all = document.querySelector(".row-2");
const row3all = document.querySelector(".row-3");
const row4all = document.querySelector(".row-4");
const row5all = document.querySelector(".row-5");
const row6all = document.querySelector(".row-6");
const gameBoardRows = [row1all, row2all, row3all, row4all, row5all, row6all];
const row1 = document.querySelectorAll(".row-1-letter");
const row2 = document.querySelectorAll(".row-2-letter");
const row3 = document.querySelectorAll(".row-3-letter");
const row4 = document.querySelectorAll(".row-4-letter");
const row5 = document.querySelectorAll(".row-5-letter");
const row6 = document.querySelectorAll(".row-6-letter");
const gameBoard = [row1, row2, row3, row4, row5, row6];
let gameWon = 'no'
let guess = ``;
let guessAttempt = 0;
function newAnswer(items) {
    return items[Math.floor(Math.random()*items.length)];
}
let answer = "";
let answerLetters = "";
function newGame() {
    answer = newAnswer(answers);
    answerLetters = answer.split("");
    gameWon = 'no'
    for (boardRow in gameBoardRows){
        for (let i = 0; i < 5; i++) {
            gameBoard[boardRow][i].style.background = `white`;
            gameBoard[boardRow][i].style.color = `black`;
            gameBoard[boardRow][i].innerText = ``;
        }
    }
    guessAttempt = 0
    
}
function flushGuess(word) {
    if (guessAttempt === 6) {
        console.log(`too many guesses`);
    } else {
        console.log(word);
        guess = ``;
        guessAttempt++;
    }
}
function fillBoardLetter(letter) {
    const letterToChange = gameBoard[guessAttempt][(guess.length - 1)];
    letterToChange.innerText = letter;
}
document.addEventListener("keyup", function(evt) {
    if (gameWon == 'yes'){
        return
    }
    const pressedKey = evt.code;
    const typedLetter = pressedKey.substring(3);
    gameBoardRows[guessAttempt].classList.remove("apply-shake");    
    if (pressedKey == `Backspace`) {
        if (guess.length === 0) {
            return;
        }
        fillBoardLetter(``);
        guess = guess.slice(0, -1);
    } else if (guess.length === 5 && pressedKey != `Enter`) {
        return;
    } else if (pressedKey.substring(0,3) === `Key`) {
        guess += typedLetter;
        fillBoardLetter(typedLetter)
    } else if (pressedKey === `Enter`){
        checkForValidGuess(guess);
    } else {
        return;
    }
});
function checkForValidGuess(guess) {
    if (words.includes(guess.toLowerCase())) {
        guessLetterInformation(guess);
        flushGuess(guess);
    } else {
        gameBoardRows[guessAttempt].classList.add("apply-shake");
    }
}
function guessLetterInformation(guess) {
    guess = guess.toLowerCase();
    let guessLetters = guess.split("");
    if (guess === answer) {
        for (let i = 0; i < 5; i++) {
            gameBoard[guessAttempt][i].style.background = `green`;
            gameBoard[guessAttempt][i].style.color = `white`;
            // create a class that requires new game to start before allowing input
        }
        gameWon = 'yes'
        return
    }
    for (let letterIndex = 0; letterIndex < 5; letterIndex++) {
        let letter = guessLetters[letterIndex];
        if (letter === answerLetters[letterIndex]) {
            colorGuessLetter(letterIndex, `green`);
        } else if (answerLetters.includes(letter)) {
            let AnswerletterCount = countOccurances(letter, answerLetters);
            let GuessletterCount = countOccurances(letter, guessLetters);
            let doubleLetterList = guessLetters.slice(0, letterIndex + 1);
            let doubleLetterCheck = countOccurances(letter, doubleLetterList);
            if (GuessletterCount <= AnswerletterCount) {
                colorGuessLetter(letterIndex, `yellow`, `black`);
            } else if (guessLetters[answerLetters.indexOf(letter)] === letter) {
                colorGuessLetter(letterIndex, `black`);
            } else if (doubleLetterCheck <= AnswerletterCount) {
                colorGuessLetter(letterIndex, `black`);
            } else {
                colorGuessLetter(letterIndex, `yellow`, `black`);
            }
        } else {
            colorGuessLetter(letterIndex, `black`);
        }
    }
}
function colorGuessLetter(letterIndex, color, letterColor = 'white') {
    gameBoard[guessAttempt][letterIndex].style.background = color;
    gameBoard[guessAttempt][letterIndex].style.color = letterColor;
}
function countOccurances(letter, arrayOfLetters) {
    let freq = 0;
    for (letterInArray in arrayOfLetters) {
        if (letter === arrayOfLetters[letterInArray]) {
            freq += 1
        }
    }
    return freq;
}
document.addEventListener('readystatechange', event => { 
    // When window loaded ( external resources are loaded too- `css`,`src`, etc...) 
    if (event.target.readyState === "complete") {
        newGame();
        const newGameButton = document.getElementById("new-game-btn");
        newGameButton.addEventListener("click", newGame);
    }
});
