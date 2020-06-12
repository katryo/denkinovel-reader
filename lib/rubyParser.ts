const PLAIN = 'PLAIN';
const RUBY = 'RUBY';

interface PlainElement {
  type: typeof PLAIN;
  plainText: string;
}

interface RubyElement {
  type: typeof RUBY;
  baseText: string;
  rubyText: string;
}

type TextElement = PlainElement | RubyElement;

const isPlain = (elem: TextElement): elem is PlainElement => {
  return elem.type === PLAIN;
};

const parse = (text: string): TextElement[] => {
  const ret: TextElement[] = [];
  ret.push({ type: PLAIN, plainText: text });
  return ret;
};

export { isPlain, parse };
