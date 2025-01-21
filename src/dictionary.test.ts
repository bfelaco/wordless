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
  const pattern = new RegExp('\\bTODAY\\b', 'g');
  expect(pattern.test(String(dictionary))).toBeTruthy();
});

test('dictionary match TODAY array', () => {
  const pattern = /\bTODAY\b/g;
  const matches = String(dictionary).match(pattern);
  expect(matches).not.toBeNull();
  expect(matches).toEqual(['TODAY']);
});

test('dictionary contains other words with same letters as TODAY', () => {
  expect(dictionary.match(/\b(?=\w*T)(?=\w*O)(?=\w*D)(?=\w*A)(?=\w*Y)\w{5}\b/g)).toEqual([
    'TOADY',
    'TODAY',
  ]);
});
