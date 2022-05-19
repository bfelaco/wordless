import dictionary from './dictionary';

export enum GuessResult {
    UNKNOWN = 'BLACK',
    ABSENT = 'GREY',
    CORRECT = 'GREEN', 
    PRESENT = 'YELLOW',
}

export type LetterGuess = {
    letter: string,
    result: GuessResult,
}

export type WordGuess = LetterGuess[];

export function parseGuess(guess: string): WordGuess {
    let results: Array<LetterGuess> = [];

    let result: GuessResult = GuessResult.ABSENT;
    for (let letter of guess.toUpperCase()) {
        if (/\s+/.test(letter)) {
            continue;
        } else if (letter === '+') {
            result = GuessResult.PRESENT;
        } else if (letter === '=') {
            result = GuessResult.CORRECT;
        } else if (/[A-Z]/.test(letter)) {
            results.push({letter, result});
            result = GuessResult.ABSENT;
        } else {
            throw new Error(`Invalid guess string ${guess}.`);
        }
    }
    if (result !== GuessResult.ABSENT) {
        throw new Error("Invalid guess - dangling modifier.");
    }
    return results;
}

export function buildMatcher(guesses: WordGuess[], wordLength: number = 5) {
    // Tuple of correct (green) letters in word position, or 'undefined'.
    let correctMatches: string[] = [];
    // Tuple of possible (yellow) letters in word position, or 'undefined'.
    let presentMatches: string[][] = [];
    // Set of all yellow letters found.
    let presentLetters: string[] = [];
    // Array of absent (grey) letters
    let absentMatches: string[] = [];
    for (let wordGuess of guesses) {
        for (let i = 0; i < wordGuess.length; i++) {
            let letterGuess = wordGuess[i];
            if (letterGuess.result === GuessResult.ABSENT) {
                absentMatches = [...absentMatches, letterGuess.letter];
            }
            if (letterGuess.result === GuessResult.CORRECT) {
                if (correctMatches[i] && correctMatches[i] !== letterGuess.letter) {
                    console.error('Invalid guesses input - multiple GREEN letters in same position.');
                }
                correctMatches[i] = letterGuess.letter;
            }
            if (letterGuess.result === GuessResult.PRESENT) {
                presentMatches[i] = [...(presentMatches[i] || []), letterGuess.letter];

                presentLetters = [...presentLetters, letterGuess.letter];
            }
        }
    }

    function charPattern(i: number) {
        if (correctMatches[i]) {
            return correctMatches[i];
        } else {
            return '[^' + [...absentMatches, ...(presentMatches[i] || [])].sort().join('') + ']';
        }
    }

    let positionalAssertions = '(?=';
    for (let i = 0; i < wordLength; i++) {
        positionalAssertions += charPattern(i);
    }
    positionalAssertions += ')'

    // The yellow letters are used to create a series of lookahead matches to assert that the word contains
    // all of the yellow letters somewhere.
    let containsLetterAssertions = '';
    for (let letter of presentLetters) {
        containsLetterAssertions += '(?=\\w*' + letter + ')'
    }

    let basicPattern = `\\w{${wordLength}}`;

    // Wrap expression in word boundaries to ensure correct length.
    // Use global modifier in order to get the complete list of matches in 1 step.
    return new RegExp('\\b' + positionalAssertions + containsLetterAssertions + basicPattern + '\\b', 'g');
}

export function findWords(guesses?: WordGuess[], wordLength: number = 5) {
    if (! guesses || guesses.length === 0) {
        return [];
    }
    const matcher = buildMatcher(guesses, wordLength);

    return dictionary.match(matcher) || [];
}

export const isWord = (word: string) => new RegExp('\\b'+ word + '\\b', 'g').test(dictionary);
