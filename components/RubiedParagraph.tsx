import { ReactElement, Fragment } from 'react';

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

type Element = PlainElement | RubyElement;

const RubiedParagraph = (props: { text: string }) => {
  const { text } = props;

  const doc: Element[] = [
    { type: PLAIN, plainText: 'それでは' },
    {
      type: RUBY,
      baseText: '明日',
      rubyText: 'あした',
    },
    { type: PLAIN, plainText: '会いましょう' },
  ];

  const isPlain = (elem: Element): elem is PlainElement => {
    return elem.type === PLAIN;
  };

  const ps: ReactElement[] = [];
  for (let i = 0; i < doc.length; i++) {
    const elem = doc[i];
    if (isPlain(elem)) {
      ps.push(<Fragment key={i}>{elem.plainText}</Fragment>);
    } else {
      ps.push(
        <ruby key={i}>
          {elem.baseText}
          <rp>（</rp>
          <rt>{elem.rubyText}</rt>
          <rp>）</rp>
        </ruby>,
      );
    }
  }

  return <p style={{ color: 'white' }}>{ps}</p>;
};

export { RubiedParagraph };
