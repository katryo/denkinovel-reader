import fs from 'fs';
import path from 'path';
import Head from 'next/head';
import { StoryContainer } from '../../components/StoryContainer';

const Demo = (props) => {
  return (
    <div>
      <Head>
        <title>Denkinovel Demo</title>
        <link href="https://fonts.googleapis.com/css2?family=Noto+Serif+JP&display=swap" rel="stylesheet"></link>
      </Head>
      <StoryContainer episode={props.episode} />
    </div>
  );
};

export default Demo;

export async function getStaticPaths() {
  // We'll pre-render only these paths at build time.
  // { fallback: false } means other routes should 404.
  return { paths: [`/demo/2`], fallback: false };
}

export async function getStaticProps({ params }) {
  const filePath = path.join(process.cwd(), 'static', 'episode2.json');

  const episodeJSON = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  // By returning { props: posts }, the Blog component
  // will receive `posts` as a prop at build time`
  return {
    props: {
      episode: episodeJSON.episode,
    },
  };
}
