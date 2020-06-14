import { ReactElement, Fragment } from 'react';
import { parse, isPlain } from '../lib/rubyParser';

const RubiedParagraph = (props: { text: string; style: any }) => {
  const { text, style } = props;

  const doc = parse(text);

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

  return <p style={style}>{ps}</p>;
};

export { RubiedParagraph };
