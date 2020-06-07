import fs from 'fs';
import path from 'path';
import { StoryContainer } from '../../components/StoryContainer';

const Demo = (props) => {
  return (
    <div>
      <StoryContainer episode={props.episode} />
    </div>
  );
};

export default Demo;

export async function getStaticProps() {
  const filePath = path.join(process.cwd(), 'static', 'episode.json');

  const episodeJSON = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  // By returning { props: posts }, the Blog component
  // will receive `posts` as a prop at build time`
  return {
    props: {
      episode: episodeJSON.episode,
    },
  };
}
