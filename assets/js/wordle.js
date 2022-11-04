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
function newAnswer() {
    return answers[Math.floor(Math.random()*answers.length)];
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
        if (guessAttempt === 0){
            answer = newAnswer(answers);
            answerLetters = answer.split("");
        } else if (guess.length === 0) {
            return;
        }
        checkForValidGuess(guess);
    } else {
        return;
    }
});
function screenKeyboardInput(letter) {
    if (gameWon == 'yes'){
        return
    }
    const typedLetter = letter.toUpperCase()
    const pressedKey = letter
    gameBoardRows[guessAttempt].classList.remove("apply-shake");    
    if (pressedKey == `Backspace`) {
        if (guess.length === 0) {
            return;
        }
        fillBoardLetter(``);
        guess = guess.slice(0, -1);
    } else if (guess.length === 5 && pressedKey != `Enter`) {
        return;
    } else if (pressedKey != `Enter` && pressedKey !=  `Backspace`) {
        guess += typedLetter;
        fillBoardLetter(typedLetter)
    } else if (pressedKey === `Enter`) {
        if (guessAttempt === 0){
            answer = newAnswer(answers);
            answerLetters = answer.split("");
        }
        checkForValidGuess(guess);
    } else {
        return;
    }
};
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
            gameBoard[guessAttempt][i].style.background = `#538d4e`;
            gameBoard[guessAttempt][i].style.color = `white`;
            // create a class that requires new game to start before allowing input
        }
        gameWon = 'yes'
        return
    }
    for (let letterIndex = 0; letterIndex < 5; letterIndex++) {
        let letter = guessLetters[letterIndex];
        if (letter === answerLetters[letterIndex]) {
            colorGuessLetter(letterIndex, `#538d4e`);
        } else if (answerLetters.includes(letter)) {
            let AnswerletterCount = countOccurances(letter, answerLetters);
            let GuessletterCount = countOccurances(letter, guessLetters);
            let doubleLetterList = guessLetters.slice(0, letterIndex + 1);
            let doubleLetterCheck = countOccurances(letter, doubleLetterList);
            if (GuessletterCount <= AnswerletterCount) {
                colorGuessLetter(letterIndex, `#b59f3b`);
            } else if (guessLetters[answerLetters.indexOf(letter)] === letter) {
                colorGuessLetter(letterIndex, `#3a3a3c`);
            } else if (doubleLetterCheck <= AnswerletterCount) {
                colorGuessLetter(letterIndex, `#3a3a3c`);
            } else {
                colorGuessLetter(letterIndex, `#b59f3b`);
            }
        } else {
            colorGuessLetter(letterIndex, `#3a3a3c`);
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
const newGameButton = document.getElementById("new-game-btn");
newGameButton.addEventListener("click", newGame);

// keyboard
const Keyboard = {
    elements: {
        main: null,
        keysContainer: null,
        keys: []
    },

    eventHandlers: {
        oninput: null,
        onclose: null
    },

    properties: {
        value: "",
        capsLock: false
    },

    init() {
        // Create main elements
        this.elements.main = document.createElement("div");
        this.elements.keysContainer = document.createElement("div");

        // Setup main elements
        this.elements.main.classList.add("keyboard");
        this.elements.keysContainer.classList.add("keyboard__keys");
        this.elements.keysContainer.appendChild(this._createKeys());

        this.elements.keys = this.elements.keysContainer.querySelectorAll(".keyboard__key");

        // Add to DOM
        this.elements.main.appendChild(this.elements.keysContainer);
        document.body.appendChild(this.elements.main);

        // Automatically use keyboard for elements with .use-keyboard-input
        document.querySelectorAll(".use-keyboard-input").forEach(element => {
            element.addEventListener("focus", () => {
                this.open(element.value, currentValue => {
                    element.value = currentValue;
                });
            });
        });
    },

    _createKeys() {
        const fragment = document.createDocumentFragment();
        const keyLayout = [
            
              "q", "w", "e", "r", "t", "y", "u", "i", "o", "p",
            "a", "s", "d", "f", "g", "h", "j", "k", "l", "Backspace",
                  "z", "x", "c", "v", "b", "n", "m","Enter",
        ];

        // Creates HTML for an icon
        const createIconHTML = (icon_name) => {
            return `<i class="material-icons">${icon_name}</i>`;
        };

        keyLayout.forEach(key => {
            const keyElement = document.createElement("button");
            const insertLineBreak = ["p", "Backspace", "Enter"].indexOf(key) !== -1;

            // Add attributes/classes
            keyElement.setAttribute("type", "button");
            keyElement.classList.add("keyboard__key");

            switch (key) {
                case "Backspace":
                    keyElement.classList.add("keyboard__key--wide");
                    keyElement.innerHTML = createIconHTML("Backspace");

                    keyElement.addEventListener("click", () => {
                        // this.properties.value = this.properties.value.substring(0, this.properties.value.length - 1);
                        this.properties.value = "Backspace";
                        screenKeyboardInput(this.properties.value);
                        this._triggerEvent("oninput");
                    });

                    break;

                case "Enter":
                    keyElement.classList.add("keyboard__key--wide");
                    keyElement.innerHTML = createIconHTML("Enter");

                    keyElement.addEventListener("click", () => {
                        this.properties.value = "Enter";
                        screenKeyboardInput(letter = this.properties.value);    
                        this._triggerEvent("oninput");
                    });

                    break;

                default:
                    keyElement.textContent = key.toLowerCase();

                    keyElement.addEventListener("click", () => {
                        this.properties.value = this.properties.capsLock ? key.toUpperCase() : key.toLowerCase();
                        console.log(this.properties.value)
                        screenKeyboardInput(letter = (this.properties.value));
                        this._triggerEvent("oninput");
                    });

                    break;
            }

            fragment.appendChild(keyElement);

            if (insertLineBreak) {
                fragment.appendChild(document.createElement("br"));
            }
        });

        return fragment;
    },

    _triggerEvent(handlerName) {
        if (typeof this.eventHandlers[handlerName] == "function") {
            this.eventHandlers[handlerName](this.properties.value);
        }
    },

    open(initialValue, oninput, onclose) {
        this.properties.value = initialValue || "";
        this.eventHandlers.oninput = oninput;
        this.eventHandlers.onclose = onclose;
    },

    close() {
        this.properties.value = "";
        this.eventHandlers.oninput = oninput;
        this.eventHandlers.onclose = onclose;
    }
};

window.addEventListener("DOMContentLoaded", function () {
    Keyboard.init();
});
