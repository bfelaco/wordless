import { expect, test } from 'vitest';
import { parseGuess, GuessResult } from './solver';

test('parses simple word', () => {
  const simpleWord = 'guess';

  const guess = parseGuess(simpleWord);

  expect(guess).toStrictEqual([
    { letter: 'G', result: GuessResult.ABSENT },
    { letter: 'U', result: GuessResult.ABSENT },
    { letter: 'E', result: GuessResult.ABSENT },
    { letter: 'S', result: GuessResult.ABSENT },
    { letter: 'S', result: GuessResult.ABSENT },
  ]);
});

test('parses yellow letters', () => {
  const simpleWord = '+gu+ess';

  const guess = parseGuess(simpleWord);

  expect(guess).toStrictEqual([
    { letter: 'G', result: GuessResult.PRESENT },
    { letter: 'U', result: GuessResult.ABSENT },
    { letter: 'E', result: GuessResult.PRESENT },
    { letter: 'S', result: GuessResult.ABSENT },
    { letter: 'S', result: GuessResult.ABSENT },
  ]);
});

test('parses green letters', () => {
  const simpleWord = '=gu=ess';

  const guess = parseGuess(simpleWord);

  expect(guess).toStrictEqual([
    { letter: 'G', result: GuessResult.CORRECT },
    { letter: 'U', result: GuessResult.ABSENT },
    { letter: 'E', result: GuessResult.CORRECT },
    { letter: 'S', result: GuessResult.ABSENT },
    { letter: 'S', result: GuessResult.ABSENT },
  ]);
});

test('allows spaces', () => {
  const simpleWord = '=g u =e s s';

  const guess = parseGuess(simpleWord);

  expect(guess).toStrictEqual([
    { letter: 'G', result: GuessResult.CORRECT },
    { letter: 'U', result: GuessResult.ABSENT },
    { letter: 'E', result: GuessResult.CORRECT },
    { letter: 'S', result: GuessResult.ABSENT },
    { letter: 'S', result: GuessResult.ABSENT },
  ]);
});

test('allows mixed case', () => {
  const simpleWord = '=G u =E s s';

  const guess = parseGuess(simpleWord);

  expect(guess).toStrictEqual([
    { letter: 'G', result: GuessResult.CORRECT },
    { letter: 'U', result: GuessResult.ABSENT },
    { letter: 'E', result: GuessResult.CORRECT },
    { letter: 'S', result: GuessResult.ABSENT },
    { letter: 'S', result: GuessResult.ABSENT },
  ]);
});

test('fails dangling modifier', () => {
  const simpleWord = '=G u =E s s +';

  expect(() => parseGuess(simpleWord)).toThrowError();
});

test('fails bogus characters', () => {
  const simpleWord = '=G u =E s * s +';

  expect(() => parseGuess(simpleWord)).toThrowError();
});
