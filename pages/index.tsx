import Head from 'next/head';
import { Flex } from '@chakra-ui/core';

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
          <p className="description">
            Get started by editing <code>pages/index.js</code>
          </p>
        </Flex>
      </Flex>
    </main>
  </div>
);

export default Home;
