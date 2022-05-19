import {findWords, parseGuess, buildMatcher} from './solver';

const guess = 'f=oun+d';
const guesses = [
    parseGuess(guess),
//    parseGuess('m=o=d=al'),
]

test(`builds regexp for ${guess}`, () => {
    const regexp = buildMatcher(guesses);

    expect(regexp.toString()).toStrictEqual(
        '/\\b(?=[^FNU]O[^FNU][^FNU][^DFNU])(?=\\w*D)\\w{5}\\b/g'
        );
});

test(`finds word candidates for ${guess}`, () => {
    const wordMatches = findWords(guesses);
    expect(wordMatches).toContain(
        'TODAY'
    );

    expect(wordMatches).toContain(
        'BODES'
    );

    expect(wordMatches).not.toContain(
        'FOUND'
    );
});

const secondGuess = 'm=o=d=al';
const secondGuesses = [
    parseGuess(guess),
    parseGuess(secondGuess),
]

test(`finds word candidates for ${guess} and ${secondGuess}`, () => {
    const wordMatches = findWords(secondGuesses);
    expect(wordMatches).toContain(
        'TODAY'
    );

    expect(wordMatches).toContain(
        'CODAS'
    );

    expect(wordMatches).toContain(
        'SODAS'
    );

    expect(wordMatches).not.toContain(
        'FOUND'
    );
});
