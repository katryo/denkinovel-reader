import Head from 'next/head';
import Link from 'next/link';

const Demo = (props) => {
  return (
    <div>
      <Head>
        <title>Denkinovel Demo</title>
        <link href="https://fonts.googleapis.com/css2?family=Noto+Serif+JP&display=swap" rel="stylesheet"></link>
      </Head>
      <div>
        <ul>
          <li>
            <Link href="/">
              <a>Home</a>
            </Link>
          </li>
          <li>
            <Link href="/demo/2">
              <a>2</a>
            </Link>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Demo;
