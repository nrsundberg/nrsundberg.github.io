let possibleGuesses = JSON.parse(answers);

const row1 = document.querySelectorAll(".row-1-letter");
const row2 = document.querySelectorAll(".row-2-letter");
const row3 = document.querySelectorAll(".row-3-letter");
const row4 = document.querySelectorAll(".row-4-letter");
const row5 = document.querySelectorAll(".row-5-letter");
const row6 = document.querySelectorAll(".row-6-letter");
const gameBoard = [row1, row2, row3, row4, row5, row6];

let guess = ``
let guessAttempt = 0

function flushGuess(word) {
    if (guessAttempt === 6) {
        console.log(`too many guesses`)
    } else {
        console.log(word);
        guess = ``
        guessAttempt++
    }
}
function fillBoardLetter(letter) {
    const letterToChange = gameBoard[guessAttempt][(guess.length - 1)]
    letterToChange.innerText = letter
}
document.addEventListener("keyup", function(evt) {
    const pressedKey = evt.code;
    const typedLetter = pressedKey.substring(3);    
    console.log(pressedKey);
    if (pressedKey == `Backspace`) {
        guess = guess.slice(0, -1);
        console.log(guess);
    } else if (guess.length === 5 && pressedKey != `Enter`) {
        return;
    } else if (pressedKey.substring(0,3) === `Key`) {
        guess += typedLetter;
        fillBoardLetter(typedLetter)
        console.log(guess);
    } else if (pressedKey === `Enter`){
        if (guess.length < 5) {
            for (let i = 0; i < gameBoard[guessAttempt].length; i++) {
                gameBoard[guessAttempt][i].style.backgroundColor = "red";
                gameBoard[guessAttempt][i].style.color = "white";
            }
        } else {
            flushGuess(guess);
        }
    } else {
        return;
    }
});
