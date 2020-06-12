import { parse } from '../lib/rubyParser';

test('Parse a plain text', () => {
  expect(parse('Cool beans.')).toStrictEqual([{ type: 'PLAIN', plainText: 'Cool beans.' }]);
});
