import { ReactElement, Fragment } from 'react';
import { parse, isPlain } from '../lib/rubyParser';

const RubiedParagraph = (props: { text: string }) => {
  const { text } = props;

  const doc = [
    { type: 'PLAIN' as 'PLAIN', plainText: 'それでは' },
    {
      type: 'RUBY' as 'RUBY',
      baseText: '明日',
      rubyText: 'あした',
    },
    { type: 'PLAIN' as 'PLAIN', plainText: '会いましょう' },
  ];

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
