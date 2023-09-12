const americanOnly = require('./american-only.js');
const americanToBritishSpelling = require('./american-to-british-spelling.js');
const americanToBritishTitles = require("./american-to-british-titles.js")
const britishOnly = require('./british-only.js')

// function used to change to britishToAmerican spelling and titles.
function swapKeysAndValues(obj) {
  const swappedObj = {};

  Object.keys(obj).forEach((key) => {
    if (obj.hasOwnProperty(key)) {
      const value = obj[key];
      swappedObj[value] = key;
    };
  });

  return swappedObj;
}

function capitalise(str) {
  console.log(str, "WILL BE CAPITALISED")
  return str[0].toUpperCase() + str.slice(1);
};

const britishToAmericanSpelling = swapKeysAndValues(americanToBritishSpelling);

const spelling = {
  "american-to-british": americanToBritishSpelling,
  "british-to-american": britishToAmericanSpelling,
};

const exclusive = {
  "american-to-british": americanOnly,
  "british-to-american": britishOnly
};

const timeRegex = {
  "american-to-british": /^(?:1[0-2]|\d{1})\:(?:[0-5]\d)/,
  "british-to-american": /^(?:1[0-2]|\d{1})\.(?:[0-5]\d)/,
};

const titleRegex = {
  "american-to-british": /^(?:mr|mrs|ms|mx|dr|prof)\./i,
  "british-to-american": /^(?:mr|mrs|ms|mx|dr|prof)/i,
};

const punctuationRegex = /[\.\?\!\:\,\;]$/;

// switches between a colon or full stop depending on the locale
function timeTranslator(time, locale) {
  if (locale === "american-to-british") {
    return `<span class="highlight">${time.replace(":", ".")}</span>`;
  } else if (locale === "british-to-american") {
    return `<span class="highlight">${time.replace(".", ":")}</span>`;
  };
};

// removes or adds the full stop depending on the locale
function titleTranslator(title, locale) {
  if (locale === "american-to-british") {
    return `<span class="highlight">${title.slice(0, -1)}</span>`;
  } else if (locale === "british-to-american") {
    return `<span class="highlight">${title}.</span>`;
  };
};

function expressionTranslator(first, second, third, locale) {
  const translations = exclusive[locale];
  const capitalised = first[0] === first[0].toUpperCase();

  // if there are three words
  if (first && second && third) {
    const phrase = [first, second, third].join(" ").toLowerCase().replace(punctuationRegex, "");
    console.log(phrase);

    const hasPunctuation = punctuationRegex.test(third);

    if (translations[phrase]) {
      return {
        translation: `<span class='highlight'>${capitalised ? capitalise(translations[phrase]) : translations[phrase]}</span>${hasPunctuation ? third.at(-1) : ""}`, wordsUsed: 3,
      };
    };
  };

  // if there are two words
  if (first && second) {
    const phrase = [first, second].join(" ").toLowerCase().replace(punctuationRegex, "");
    const capitalised = first[0] === first[0].toUpperCase();

    const hasPunctuation = punctuationRegex.test(second);

    if (translations[phrase]) {
      return {
        translation: `<span class='highlight'>${capitalised ? capitalise(translations[phrase]) : translations[phrase]}</span>${hasPunctuation ? second.at(-1) : ""}`, wordsUsed: 2,
      };
    };
  };

  // if there is one word
  if (first) {
    const word = first.toLowerCase().replace(punctuationRegex, "");
    const capitalised = word[0] === word[0].toUpperCase();

    const hasPunctuation = punctuationRegex.test(first);

    if (translations[word]) {
      return {
        translation: `<span class='highlight'>${capitalised ? capitalise(translations[word]) : translations[word]}</span>${hasPunctuation ? first.at(-1) : ""}`, wordsUsed: 1,
      };
    };
  };

  // if there are no words
  return { translation: "", wordsUsed: 0 };
};

function spellingTranslator(word, locale) {
  const capitalised = word[0] === word[0].toUpperCase();
  const hasPunctuation = punctuationRegex.test(word);
  const formattedWord = word.toLowerCase().replace(punctuationRegex, "");
  const dictionary = spelling[locale];

  if (dictionary[formattedWord]) {
    return `<span class="highlight">${capitalised ? capitalise(dictionary[formattedWord]) : dictionary[formattedWord]}</span>${hasPunctuation ? word.at(-1) : ""}`
  };
  // if the word does not need to be spelled differently
  return word;
};


class Translator {

  translate(sentence, locale) {

    // if there is no sentence
    if (!sentence) {
      return { error: "No text to translate" };
    };

    // if the locale is invalid
    if (locale !== "american-to-british" && locale !== "british-to-american") {
      return { error: "Invalid value for locale field" };
    };

    const translatedWords = [];

    // split the sentence
    let words = sentence.split(" ");

    while (words.length > 0) {
      const [first, second, third] = words;

      // check if the first word is a time
      if (timeRegex[locale].test(first) === true) {
        translatedWords.push(timeTranslator(first, locale));
        words.shift();
        continue;
      };

      // if not, check if the first word is a title
      if (titleRegex[locale].test(first) === true) {
        translatedWords.push(titleTranslator(first, locale));
        words.shift();
        continue;
      };

      // if not, check if the words make up an expression
      const expressionTranslation = expressionTranslator(first, second, third, locale);
      if (expressionTranslation.wordsUsed > 0) {
        translatedWords.push(expressionTranslation.translation);
        words = words.slice(expressionTranslation.wordsUsed);
        continue;
      };

      // if not, translate the spelling of the first word
      translatedWords.push(spellingTranslator(first, locale));
      words.shift();
    };

    // after the while loop, join the translated words
    const translation = translatedWords.join(" ");

    return {
      text: sentence,
      translation: sentence !== translation ? translation : "Everything looks good to me!"
    };
  }

}

module.exports = Translator;