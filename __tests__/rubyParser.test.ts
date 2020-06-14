import { parse } from '../lib/rubyParser';

test('Parse a plain text', () => {
  expect(parse('Cool beans.')).toStrictEqual([{ type: 'PLAIN', plainText: 'Cool beans.' }]);
});

test('Parse a ruby-only text', () => {
  expect(parse('|明日《あした》')).toStrictEqual([{ type: 'RUBY', baseText: '明日', rubyText: 'あした' }]);
});

test('Parse a ruby and a plain text', () => {
  expect(parse('それでは|明日《あした》お会いしましょう')).toStrictEqual([
    { type: 'PLAIN', plainText: 'それでは' },
    { type: 'RUBY', baseText: '明日', rubyText: 'あした' },
    { type: 'PLAIN', plainText: 'お会いしましょう' },
  ]);
});

test('Parse a text with two consecutive rubied words', () => {
  expect(parse('|天上天下《てんじょうげんげ》｜唯我独尊《ゆいがどくそん》')).toStrictEqual([
    { type: 'RUBY', baseText: '天上天下', rubyText: 'てんじょうげんげ' },
    { type: 'RUBY', baseText: '唯我独尊', rubyText: 'ゆいがどくそん' },
  ]);
});

test('Parse a text with two consecutive base text start characters', () => {
  expect(parse('|｜記号《きごう》')).toStrictEqual([{ type: 'RUBY', baseText: '｜記号', rubyText: 'きごう' }]);
});

test('Parse a text with non-ruby paranthesis characters', () => {
  expect(parse('ルビではなく《ただのかっこ》です')).toStrictEqual([
    { type: 'PLAIN', plainText: 'ルビではなく《ただのかっこ》です' },
  ]);
});
