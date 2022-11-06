// variables //
let [gameWon, guess, guessAttempt, words, answers, answer, possibleWords, topFiveGuesses] = ['no', ``, 0, Array(), Array(), ``, Array(), Array()];
let [greenTile, greyTile, yellowTile, lightGrey] = [`#538d4e`, `#3a3a3c`, `#b59f3b`, `#83838b`];
const [letterTiles, newGameButton, gameBoardRows, helpButton]  = [document.querySelectorAll(".letter"), document.getElementById("new-game-btn"), document.querySelectorAll(".row"), document.querySelector(".help-question-mark")];
// load files //
d3.csv("/assets/csv/answers.csv", function(data) {
    answers.push(data.columns);
    answers = answers[0];
    answer = answers[Math.floor(Math.random()*answers.length)];
});
d3.csv("/assets/csv/words_dictionary.csv", function(data) {
    words.push(data.columns);
    words = words[0];
    possibleWordsRanked = guessOptimization(words);
    topFiveGuesses = Object.entries(possibleWordsRanked).sort((a,b) => b[1]-a[1]).slice(0,5);
    console.log(topFiveGuesses);
});
// event listeners //
newGameButton.addEventListener("click", newGame);
helpButton.addEventListener("click", function() {
    const answerBox = document.querySelector(".answer-pop-up");
    answerBox.style.cssText = `display: none;`;
    const popUp = document.querySelector(".pop-up-full");
    popUp.style.cssText = `display: block`;
})
const popUpClose = document.querySelector(".leave-pop-up")
popUpClose.addEventListener("click", function() {
    const popUp = document.querySelector(".pop-up-full");
    popUp.style.cssText = `display: none`;
})
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
        possibleWordsRanked = guessOptimization(possibleWords);
        topFiveGuesses = Object.entries(possibleWordsRanked).sort((a,b) => b[1]-a[1]).slice(0,5);
        console.log(topFiveGuesses);
        if (guessAttempt === 6 && guess != answer) {
            // code to pop up correct answer
            const answerBox = document.querySelector(".answer-pop-up");
            answerBox.innerText = answer.toUpperCase();
            answerBox.style.cssText = `display: flex;`;
        }        
        guess = ``
    } else {
        gameBoardRows[guessAttempt].classList.add("apply-shake");
    }
};
let [lettersInPosition, lettersNotInPosition, lettersNotInWord] = [{}, {}, Array()]
function colorLetterTiles(guess) {
    let possibleWordsList = Object.keys(possibleWordsRanked);
    let listOfWordsRefined = Array();
    guess = guess.toLowerCase();
    let guessLetters = guess.split("");
    let answerLetters = answer.split("")
    if (guess === answer) {
        for (let i = 0; i < 5; i++) {
            letterTiles[guessAttempt * 5 + i].style.cssText = `background: ${greenTile}; color: white; border: ${greenTile}`;
            confetti();
        }
        gameWon = 'yes'
        return
    }
    for (let letterIndex = 0; letterIndex < 5; letterIndex++) {
        let letter = guessLetters[letterIndex];
        if (letter === answerLetters[letterIndex]) {
            colorGuessLetter(letterIndex, greenTile);
            screenKeyboardShade(letter, greenTile);
            if (letter in lettersInPosition) { 
                lettersInPosition[letter].push(letterIndex);
            } else {
                lettersInPosition[letter] = [letterIndex];
            }
        } else if (answerLetters.includes(letter)) {
            if (letter in lettersNotInPosition) { 
                lettersNotInPosition[letter].push(letterIndex);
            } else {
                lettersNotInPosition[letter] = [letterIndex];
            }
            let AnswerletterCount = countOccurances(letter, answerLetters);
            let GuessletterCount = countOccurances(letter, guessLetters);
            let doubleLetterCheck = countOccurances(letter, (guessLetters.slice(0, letterIndex + 1)));
            if (GuessletterCount <= AnswerletterCount) {
                colorGuessLetter(letterIndex, yellowTile);
                screenKeyboardShade(letter, yellowTile);
            } else if (doubleLetterCheck <= AnswerletterCount) {
                colorGuessLetter(letterIndex, yellowTile);
                screenKeyboardShade(letter, yellowTile);
            } else {
                colorGuessLetter(letterIndex, greyTile);
                screenKeyboardShade(letter, greyTile);
            }
        } else {
            colorGuessLetter(letterIndex, greyTile);
            screenKeyboardShade(letter, greyTile);
            lettersNotInWord.push(letter)
        }
    }
    for (let z = 0; z < possibleWordsList.length; z++) {
        let breakWord = 'no';
        for (let a = 0; a < lettersNotInWord.length; a++) {
            if (possibleWordsList[z].includes(lettersNotInWord[a])) {
                breakWord = 'yes';
            }  
        }
        let notInPos = Object.keys(lettersNotInPosition);
        if (breakWord === 'yes') {
            continue;
        }
        for (let b = 0; b < notInPos.length; b++) {
            if (breakWord === 'yes') {
                break;
            } else if (possibleWordsList[z].includes(notInPos[b]) === false) {
                breakWord = 'yes';
                break;
            }
            let val = lettersNotInPosition[notInPos[b]]
            for (let c = 0; c < val.length; c++) {
                if (possibleWordsList[z][val[c]] === notInPos[b]) {
                    breakWord = 'yes';
                    break;
                }
            }
        }
        if (breakWord === 'yes') {
            continue;
        }
        let InPos = Object.keys(lettersInPosition);
        for (let d = 0; d < InPos.length; d++) {
            if (breakWord === 'yes') {
                break;
            }
            let val = lettersInPosition[InPos[d]]
            for (let e = 0; e < val.length; e++) {
                if (possibleWordsList[z][val[e]] != notInPos[d]) {
                    breakWord = 'yes';
                    break;
                }
            }
        }
        if (breakWord === 'yes') {
            continue;
        }
        listOfWordsRefined.push(possibleWordsList[z]);
    }
    possibleWords = listOfWordsRefined;
};
function colorGuessLetter(letterIndex, color, letterColor = 'white') {
    letterTiles[guessAttempt * 5 + letterIndex].style.cssText = `background: ${color}; color: ${letterColor}; border: ${color}`;
}
function renderGuess(letter, key = ``) {
    if (key === `Backspace`) {
            letterTiles[(guessAttempt * 5 + guess.length)].innerText = ``;
    } else {
        letterTiles[(guessAttempt * 5 + guess.length - 1)].innerText = letter.toUpperCase();
    }
};
function newGame() {
    document.getElementById("game-board").focus();
    answer = answers[Math.floor(Math.random()*answers.length)];
    gameWon = 'no';
    for (let i = 0; i <= 29; i++) {
        letterTiles[i].style.cssText = 'background: white; color: black;';
        letterTiles[i].innerText = ``;
    }
    guess = ``;
    guessAttempt = 0;
    let keyboardButtons = Array.from(document.querySelectorAll(".keyboard__key"))
    keyboardButtons.forEach(keyToChange => {
        keyToChange.style.background = lightGrey;
    const answerBox = document.querySelector(".answer-pop-up");
    answerBox.style.cssText = `display: none;`;
    possibleWordsRanked = guessOptimization(words);
    topFiveGuesses = Object.entries(possibleWordsRanked).sort((a,b) => b[1]-a[1]).slice(0,5);
    [lettersInPosition, lettersNotInPosition, lettersNotInWord] = [{}, {}, Array()]
    });
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
function screenKeyboardShade(letter, color) {
    let keyboardButtons = Array.from(document.querySelectorAll(".keyboard__key"))
                            .find(item => item.textContent === letter);
    let colorOfButton = keyboardButtons.style.background;
    switch(colorOfButton) {
        // first two are for start of game and then after a new game is started
        case '':
            keyboardButtons.style.cssText = `background: ${color}; color: white`;
            return;
        case 'rgb(131, 131, 139)':
            keyboardButtons.style.cssText = `background: ${color}; color: white`;
            return;
        // green letter already green
        case 'rgb(83, 141, 78)':
            return;
            // yellow letter if statement to move to green but not grey
        case 'rgb(181, 159, 59)':
            if (color === `#538d4e`) {
                keyboardButtons.style.cssText = `background: ${color}; color: white`;        
                return;
            } else {
                return;
            } 
            // grey moving to any color
        case 'rgb(58, 58, 60)':
            keyboardButtons.style.cssText = `background: ${color}; color: white`;
            return;
    }
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
            "Enter", "z", "x", "c", "v", "b", "n", "m","&#8592;"
        ];

        // Creates HTML for an icon
        const createIconHTML = (icon_name) => {
            return `<i class="material-icons">${icon_name}</i>`;
        };

        keyLayout.forEach(key => {
            const keyElement = document.createElement("button");
            const insertLineBreak = ["p", "l", "&#8592;"].indexOf(key) !== -1;

            // Add attributes/classes
            keyElement.setAttribute("type", "button");
            keyElement.classList.add("keyboard__key");

            switch (key) {
                case "&#8592;":
                    keyElement.classList.add("keyboard__key--wide");
                    keyElement.innerHTML = createIconHTML("&#8592;");

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

// guess optimization
let [letterOne, letterTwo, letterThree, letterFour, letterFive] = [Array(), Array(), Array(), Array(), Array()];
let letterList = [letterOne, letterTwo, letterThree, letterFour, letterFive];
let [letterOneScored, letterTwoScored, letterThreeScored, letterFourScored, letterFiveScored] = [{}, {}, {}, {}, {}];
let scoredList = [letterOneScored, letterTwoScored, letterThreeScored, letterFourScored, letterFiveScored];

function guessOptimization(wordsList){ 
    let possibleGuesses = wordsList;
    for (word in possibleGuesses) {
        let wordSplit = possibleGuesses[word].split("");
        for (letter in wordSplit) {
            letterList[letter].push(wordSplit[letter]);
        }
    }
    let [letterOneUnique, letterTwoUnique, letterThreeUnique, letterFourUnique, letterFiveUnique] = [Array.from(new Set(letterOne)), Array.from(new Set(letterTwo)), Array.from(new Set(letterThree)), Array.from(new Set(letterFour)), Array.from(new Set(letterFive))]
    let uniqueList = [letterOneUnique, letterTwoUnique, letterThreeUnique, letterFourUnique, letterFiveUnique]
    for (list in scoredList) {
        let letterString = letterList[list].join('');
        for (letter in uniqueList[list]) {
            let letterInList = uniqueList[list][letter]
            let regex =  new RegExp(letterInList,'g');
            let occurancesLetter = letterString.match(regex).length;
            let objectToBeAssigned = {};
            objectToBeAssigned[letterInList] = occurancesLetter
            Object.assign(scoredList[list], objectToBeAssigned);
        }
    } 
    let possibleWordsRanked1 = {};
    for (word in possibleGuesses) {
        let wordSplit = possibleGuesses[word].split("");
        let wordScore = 0;
        for (let i = 0; i < 5; i++) {
            wordScore += scoredList[i][wordSplit[i]];
            if (i === 4) {
                let objectToBeAssigned = {};
                objectToBeAssigned[possibleGuesses[word]] = wordScore;
                Object.assign(possibleWordsRanked1, objectToBeAssigned);
            }
        }

    }
    return possibleWordsRanked1;
};
