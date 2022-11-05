let answers = '';
let file = d3.csv("/assets/csv/answers.csv", (a) => {
    answers = a.columns;
});
let words = ''
let wordsFile = d3.csv("/assets/csv/words_dictionary.csv", (w) => {
    words = w.columns;
});