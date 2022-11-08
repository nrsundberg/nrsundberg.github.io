// variables //
let [gameWon, guess, guessAttempt, words, answers, answer, possibleWords, topFiveGuesses] = ['no', ``, 0, Array(), Array(), ``, Array(), Array()];
let [greenTile, greyTile, yellowTile, lightGrey] = [`#538d4e`, `#3a3a3c`, `#b59f3b`, `#83838b`];
let doubleLetterList = Array();

const colors = {
    green: `#538d4e`,
    grey: `#3a3a3c`,
    yellow: `#b59f3b`,
    lightGrey: `#83838b`
};
const [letterTiles, newGameButton, gameBoardRows, helpButton]  = [document.querySelectorAll(".letter"), document.getElementById("new-game-btn"), document.querySelectorAll(".row"), document.querySelectorAll(".help-question-mark")];
const wordSuggestions = document.querySelectorAll(".word-suggestions");
const totalWords = document.getElementById("total-words");
const guessSuggestions = document.querySelector(".guess-suggestions");
let [lettersInPosition, lettersNotInPosition, lettersNotInWord] = [{}, {}, Array()]
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
    totalWords.innerText = (Object.keys(possibleWordsRanked).length);
    wordSuggestions.forEach((listElement, index) => {
        listElement.innerText = topFiveGuesses[index][0];
    })
});
// event listeners //
guessSuggestions.addEventListener("click", function() {
    const popUp = document.querySelector(".pop-up-full");
    popUp.style.cssText = `display: none`;
    const answerBox = document.querySelector(".answer-pop-up");
    answerBox.style.cssText = `display: none;`;
    const wordSugBox = document.querySelector(".pop-up-suggestions");
    wordSugBox.style.cssText = `display: block;`;
})
newGameButton.addEventListener("click", newGame);
helpButton[1].addEventListener("click", function() {
    const answerBox = document.querySelector(".answer-pop-up");
    answerBox.style.cssText = `display: none;`;
    const popUp = document.querySelector(".pop-up-full");
    popUp.style.cssText = `display: block`;
})
const popUpClose = document.querySelectorAll(".leave-pop-up")
document.querySelectorAll('.leave-pop-up').forEach(xButton => {
    xButton.addEventListener('click', event => {
        const popUp = document.querySelector(".pop-up-full");
        popUp.style.cssText = `display: none`;
        const wordSugBox = document.querySelector(".pop-up-suggestions");
        wordSugBox.style.cssText = `display: none;`;
    });
});
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
        let gameWon = colorLetterTiles(guess);
        if (gameWon) {
            confetti(),
            gameWon = 'yes';
        }
        possibleWords = refinePossibleWords(possibleWordsRanked);
        guessAttempt ++;
        possibleWordsRanked = guessOptimization(possibleWords);
        totalWords.innerText = (possibleWords.length);
        let topFiveGuesses = Object.entries(possibleWordsRanked).sort((a,b) => b[1]-a[1]).slice(0,5);
        wordSuggestions.forEach((listElement, index) => {
            const textToFill = topFiveGuesses[index]?.[0];
            if (textToFill === undefined) {
                listElement.innerText = ''    
            } else {
                listElement.innerText = textToFill;
            }
        })
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

function colorLetterTiles(guess) {
    guess = guess.toLowerCase();
    [...guess].forEach((char, index) => {
        const letterOcurr = countOccurances(char, [...guess]);
        const answerOcurr = countOccurances(char, [...answer]);
        const doubleLetter = letterOcurr > 1 && answerOcurr > 1;
        if (doubleLetter) {
            doubleLetterList.push(char);
        };
        const isInWord = [...answer].includes(char);
        const isInPosition = [...answer][index] === char;
  
        if (isInPosition) {
            // adjust for double letter situation
            colorGuessLetter(index, colors['green']);
            screenKeyboardShade(char, colors['green']);
            letterPosition(char, index, lettersInPosition);
            return;
        }
  
        if (isInWord) {
            const trueYellow = checkYellow(guess, answer, index, char);
            if (trueYellow) {
                colorGuessLetter(index, colors['yellow']);
                screenKeyboardShade(char, colors['yellow']);
                letterPosition(char, index, lettersNotInPosition);
                return;
            }
            letterPosition(char, index, lettersNotInPosition);
            colorGuessLetter(index, colors['grey']);
            return;
        }
        colorGuessLetter(index, colors['grey']);
        screenKeyboardShade(char, colors['grey']);
        lettersNotInWord.push(char);

    });

    return guess === answer
}
function refinePossibleWords(wordsObject) {
    let possibleWordsList = Object.keys(wordsObject);
    let listOfWordsRefined = Array();
    possibleWordsList.forEach((word) => {
        let passDoubleLetter = true;
        if (doubleLetterList.length > 1) {
            passDoubleLetter = countOccurances(doubleLetterList[0], [...word]) > 1;
        }
        // false continues
        const nonletterInWord = [...word].some(r => lettersNotInWord.includes(r));
        // undefined continues
        let notInPositionKeys = Object?.keys(lettersNotInPosition)
        function lettersInAnswerNotWord() {
            let combinedLetters = Object.keys(lettersInPosition).concat(Object.keys(lettersNotInPosition))
            if (combinedLetters.length === 0) {
                return true;
            }
            const notInWord = combinedLetters.every(r => [...word].includes(r));
            if (notInWord) {
                return true;
            } else {
                return false;
            }
        };
        const notIncluding = lettersInAnswerNotWord?.();

        function notIn() {
            for (let i = 0; i < notInPositionKeys.length; i++) {
                let notInPositionIndex = lettersNotInPosition[notInPositionKeys[i]]
                for (let b = 0; b < notInPositionIndex.length; b++) {
                    if (word[notInPositionIndex[b]] === notInPositionKeys[i]) {
                        return false;
                    }
                }
            }
        };
        const notInPosition = notIn?.();

        let inPositionKeys = Object?.keys(lettersInPosition);
        function inPositionWord() {
            for (let i = 0; i < inPositionKeys.length; i++) {
                let inPositionIndex = lettersInPosition[inPositionKeys[i]]
                for (let b = 0; b < inPositionIndex.length; b++) {
                    if (word[inPositionIndex[b]] != inPositionKeys[i]) {
                        return false;
                    }
                }
            }
        };
        const inPosition = inPositionWord?.();

        if ((!nonletterInWord) && passDoubleLetter && notInPosition === undefined && inPosition === undefined && notIncluding) {
            listOfWordsRefined.push(word);
        }
    });
    return listOfWordsRefined;
}
    
function checkYellow(guess, answer, index, letter) {
    let AnswerletterCount = countOccurances(letter, [...answer]);
    let GuessletterCount = countOccurances(letter, [...guess]);
    let doubleLetterCheck = countOccurances(letter, ([...guess].slice(0, index + 1)));
    // double letter not correct
    if (GuessletterCount <= AnswerletterCount) {
        return true;
    } else if ([...guess][[...answer].indexOf(letter)] === letter ) {
        return false;
    } else if (doubleLetterCheck <= AnswerletterCount ) {
        return true;
    }
    return false;
};

function letterPosition(char, index, lettersList) {
    if (letter in lettersList) { 
        lettersList[char].push(index);
    } else {
        lettersList[char] = [index];
    }
}
// function is good
function colorGuessLetter(letterIndex, color, letterColor = 'white') {
    letterTiles[guessAttempt * 5 + letterIndex].style.cssText = `background: ${color}; color: ${letterColor}; border: ${color}`;
}
//  function is good
function renderGuess(letter, key = ``) {
    if (key === `Backspace`) {
            letterTiles[(guessAttempt * 5 + guess.length)].innerText = ``;
            return;
    } 
    letterTiles[(guessAttempt * 5 + guess.length - 1)].innerText = letter.toUpperCase();
};

function newGame() {
    document.getElementById("game-board").focus();
    answer = answers[Math.floor(Math.random()*answers.length)];
    gameWon = 'no';
    letterTiles.forEach(tile => {
        tile.style.cssText = 'background: white; color: black;';
        tile.innerText = ``;
    });
    guess = ``;
    guessAttempt = 0;
    let keyboardButtons = Array.from(document.querySelectorAll(".keyboard__key"))
    keyboardButtons.forEach(keyToChange => {
        keyToChange.style.background = lightGrey;
    });
    const answerBox = document.querySelector(".answer-pop-up");
    answerBox.style.cssText = `display: none;`;
    possibleWordsRanked = guessOptimization(words);
    possibleWords = words;
    topFiveGuesses = Object.entries(possibleWordsRanked).sort((a,b) => b[1]-a[1]).slice(0,5);
    lettersInPosition = {};
    lettersNotInPosition = {};
    lettersNotInWord = Array();
    doubleLetterList = Array();
    totalWords.innerText = (Object.keys(possibleWordsRanked).length);
    wordSuggestions.forEach((listElement, index) => {
        listElement.innerText = topFiveGuesses[index][0];
    });
};
function countOccurances(letter, arrayOfLetters) {
    let freq = 0;
    for (letterInArray in arrayOfLetters) {
        if (letter === arrayOfLetters[letterInArray]) {
            freq += 1
        }
    }
    return freq;
};
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

function guessOptimization(wordsList){ 
    let [letterOne, letterTwo, letterThree, letterFour, letterFive] = [Array(), Array(), Array(), Array(), Array()];
    let [letterOneScored, letterTwoScored, letterThreeScored, letterFourScored, letterFiveScored] = [{}, {}, {}, {}, {}];
    let scoredList = [letterOneScored, letterTwoScored, letterThreeScored, letterFourScored, letterFiveScored];
    let letterList = [letterOne, letterTwo, letterThree, letterFour, letterFive];
    let possibleGuessesList = wordsList;
    for (word in possibleGuessesList) {
        let wordSplit = possibleGuessesList[word].split("");
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
    for (word in possibleGuessesList) {
        let wordSplit = possibleGuessesList[word].split("");
        let wordScore = 0;
        for (let i = 0; i < 5; i++) {
            wordScore += scoredList[i][wordSplit[i]];
            if (i === 4) {
                let objectToBeAssigned = {};
                objectToBeAssigned[possibleGuessesList[word]] = wordScore;
                Object.assign(possibleWordsRanked1, objectToBeAssigned);
            }
        }

    }
    return possibleWordsRanked1;
};
