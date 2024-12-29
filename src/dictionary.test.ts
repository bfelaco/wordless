import { test, expect } from 'vitest';
import dictionary from './dictionary';

test('dictionary is string', () => {
  expect(typeof dictionary).toBe('string');
});

test('dictionary not empty', () => {
  expect(dictionary.length).toBeGreaterThan(0);
});

test('dictionary first word is AA', () => {
  expect(dictionary.substring(0, 2)).toStrictEqual('AA');
});

test('dictionary contains TODAY', () => {
  expect(/\bTODAY\b/.test(dictionary)).toBeTruthy();
});

test('dictionary match TODAY array', () => {
  expect(dictionary.match(/\bTODAY\b/g)).toEqual(['TODAY']);
});

test('dictionary contains other words with same letters as TODAY', () => {
  expect(dictionary.match(/\b(?=\w*T)(?=\w*O)(?=\w*D)(?=\w*A)(?=\w*Y)\w{5}\b/g)).toEqual([
    'TOADY',
    'TODAY',
  ]);
});
