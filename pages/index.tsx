import Head from 'next/head';
import Link from 'next/link';
import { Flex } from '@chakra-ui/react';

const Home = () => (
  <div className="container">
    <Head>
      <title>Denkinovel - Novels like movies</title>
      <link rel="icon" href="/favicon.ico" />
      <link href="https://fonts.googleapis.com/css2?family=Noto+Serif+JP&display=swap" rel="stylesheet"></link>
    </Head>

    <main>
      <Flex flexDirection="column">
        <Flex>
          <h1>Denkinovel</h1>
        </Flex>

        <Flex>
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
        </Flex>
      </Flex>
    </main>
  </div>
);

export default Home;
