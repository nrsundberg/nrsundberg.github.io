// variables //
let [gameWon, guess, guessAttempt, words, answers, answer] = ['no', ``, 0, Array(), Array(), ``];
let [greenTile, greyTile, yellowTile] = [`#538d4e`, `#3a3a3c`, `#b59f3b`];
const [letterTiles, newGameButton, gameBoardRows]  = [document.querySelectorAll(".letter"), document.getElementById("new-game-btn"), document.querySelectorAll(".row")];
// load files //
d3.csv("/assets/csv/answers.csv", function(data) {
    answers.push(data.columns);
    answers = answers[0];
    answer = answers[Math.floor(Math.random()*answers.length)];
});
d3.csv("/assets/csv/words_dictionary.csv", function(data) {
    words.push(data.columns);
    words = words[0];
});
// event listeners //
newGameButton.addEventListener("click", newGame);
document.addEventListener("keyup", function(keyPressEvent) {
    const pressedKey = keyPressEvent.code;
    const typedLetter = keyPressEvent.key;
    gamePlay(pressedKey, typedLetter);
});
document.addEventListener("DOMContentLoaded", function () {
    Keyboard.init();
});
// functions //
function gamePlay(pressedKey, typedLetter) {
    gameBoardRows[guessAttempt].classList.remove("apply-shake");
    if (gameWon === `yes` || guessAttempt === 6) {
        return;
    }
    if (pressedKey === 'Enter') {
        flushGuess();
    } else if (pressedKey.slice(0,3) === `Key`) {
        if (guess.length === 5) {
            return
        } else {
            guess += typedLetter;
            renderGuess(typedLetter);
        }
    } else if (pressedKey === `Backspace` ) {
        guess = guess.slice(0, guess.length - 1); 
        renderGuess(typedLetter, pressedKey);
    }
};
function flushGuess() {
    if (guess.length === 5 && words.includes(guess)) {
        colorLetterTiles(guess);
        guessAttempt ++;
        guess = ``
    } else {
        gameBoardRows[guessAttempt].classList.add("apply-shake");
    }
};
function colorLetterTiles(guess) {
    guess = guess.toLowerCase();
    let guessLetters = guess.split("");
    let answerLetters = answer.split("")
    if (guess === answer) {
        for (let i = 0; i < 5; i++) {
            letterTiles[guessAttempt * 5 + i].style.cssText = `background: ${greenTile}; color: white`;
        }
        gameWon = 'yes'
        return
    }
    for (let letterIndex = 0; letterIndex < 5; letterIndex++) {
        let letter = guessLetters[letterIndex];
        if (letter === answerLetters[letterIndex]) {
            colorGuessLetter(letterIndex, greenTile);
        } else if (answerLetters.includes(letter)) {
            let AnswerletterCount = countOccurances(letter, answerLetters);
            let GuessletterCount = countOccurances(letter, guessLetters);
            let doubleLetterCheck = countOccurances(letter, (guessLetters.slice(0, letterIndex + 1)));
            if (GuessletterCount <= AnswerletterCount) {
                colorGuessLetter(letterIndex, yellowTile);
            } else if (guessLetters[answerLetters.indexOf(letter)] === letter) {
                colorGuessLetter(letterIndex, greyTile);
            } else if (doubleLetterCheck <= AnswerletterCount) {
                colorGuessLetter(letterIndex, greyTile);
            } else {
                colorGuessLetter(letterIndex, yellowTile);
            }
        } else {
            colorGuessLetter(letterIndex, greyTile);
        }
    }
};
function colorGuessLetter(letterIndex, color, letterColor = 'white') {
    letterTiles[guessAttempt * 5 + letterIndex].style.cssText = `background: ${color}; color: ${letterColor}`;
}
function renderGuess(letter, key = ``) {
    if (key === `Backspace`) {
            letterTiles[(guessAttempt * 5 + guess.length)].innerText = ``
    } else {
        letterTiles[(guessAttempt * 5 + guess.length - 1)].innerText = letter
    }
};
function newGame() {
    document.getElementById("game-board").focus();
    answer = answers[Math.floor(Math.random()*answers.length)];
    gameWon = 'no'
    for (let i = 0; i < 29; i++) {
        letterTiles[i].style.cssText = 'background: white; color: black;';
        letterTiles[i].innerText = ``;
    }
    guess = ``
    guessAttempt = 0
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
// keyboard //
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
            "a", "s", "d", "f", "g", "h", "j", "k", "l", 
            "Enter", "z", "x", "c", "v", "b", "n", "m","&#129044;"
        ];

        // Creates HTML for an icon
        const createIconHTML = (icon_name) => {
            return `<i class="material-icons">${icon_name}</i>`;
        };

        keyLayout.forEach(key => {
            const keyElement = document.createElement("button");
            const insertLineBreak = ["p", "l", "&#129044;"].indexOf(key) !== -1;

            // Add attributes/classes
            keyElement.setAttribute("type", "button");
            keyElement.classList.add("keyboard__key");

            switch (key) {
                case "&#129044;":
                    keyElement.classList.add("keyboard__key--wide");
                    keyElement.innerHTML = createIconHTML("&#129044;");

                    keyElement.addEventListener("click", () => {
                        gamePlay("Backspace", "Backspace");
                    });

                    break;

                case "Enter":
                    keyElement.classList.add("keyboard__key--wide");
                    keyElement.innerHTML = createIconHTML("Enter");

                    keyElement.addEventListener("click", () => {
                        gamePlay("Enter", "Enter");    
                    });

                    break;

                default:
                    keyElement.textContent = key.toLowerCase();

                    keyElement.addEventListener("click", () => {
                        this.properties.value = key.toLowerCase();
                        gamePlay(`Key`,(this.properties.value));
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