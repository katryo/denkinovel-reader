import { CSSTransition } from 'react-transition-group';
import { Howl, Howler } from 'howler';
import { useState, useEffect } from 'react';
import fs from 'fs';
import path from 'path';

const WHITE = '#ffffff';
const PINK = '#fecbc8';
const BLUE = '#dceff5';
const GREEN = '#dcfec8';
const TRANSITION_MS = 2000;
const DEFAULT_CURRENT_MUSIC_ID = -1;

const sleep = async (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

interface Section {
  paragraphs: string[];
  music: string;
  sound: string;
  filter: string;
  bg: string;
  image: string;
  id: number;
}

interface Episode {
  seriesTitle: string;
  episodeTitle: string;
  creator: string;
  sections: Section[];
  audioMap: { [key: string]: string };
  imageMap: { [key: string]: string };
  colorMap: { [key: string]: string };
  defaultBg: string;
  defaultFilter: string;
  defaultTextColor: string;
}

const Paragraph = (props) => {
  const { keyVal, text } = props;
  if (text === '') {
    return (
      <p
        key={keyVal}
        style={{
          margin: 0,
        }}
      >
        <br />
      </p>
    );
  } else {
    return (
      <p key={keyVal} style={{ margin: 0 }}>
        {text}
      </p>
    );
  }
};

const idToSectionId = (id: number) => {
  return `section${id}`;
};

const SectionsList = (props) => {
  const { sections, currentPage, isPageShowing } = props;
  const sectionsList = sections.map((section) => {
    return (
      <CSSTransition
        in={currentPage === section.page && isPageShowing}
        timeout={TRANSITION_MS}
        classNames="page"
        key={section.id}
        id={idToSectionId(section.id)}
        onEnter={async () => {
          await sleep(2000);
        }}
      >
        <div>
          {section.paragraphs.map((paragraph, idx) => {
            const keyVal = `${section.id}-${idx.toString()}`;
            return <Paragraph keyVal={keyVal} key={keyVal} text={paragraph} />;
          })}
        </div>
      </CSSTransition>
    );
  });

  return <div>{sectionsList}</div>;
};

interface SectionIdRectTop {
  [id: number]: number;
}

const StoryContainer = (props: { episode: Episode }) => {
  const { episode } = props;
  const [lowerBGColor, setLowerBGColor] = useState(WHITE);
  const [upperBGColor, setUpperBGColor] = useState(WHITE);
  const [upperBGIn, setUpperBGIn] = useState(false);
  const [currentPage, setPage] = useState(0);
  const [isPageShowing, setIsPageShowing] = useState(true);
  const ID_STORY_CONTAINER = 'js-story-container';
  let currentBG = WHITE;
  const sectionIdRectTop: SectionIdRectTop = {};
  let effectBeginsHeight = 500;

  const onScroll = (e) => {
    const sectionId = getCurrentSectionId();
    console.log({ sectionId });
  };

  useEffect(() => {
    getSectionsY();
    document.addEventListener('scroll', onScroll);
    document.addEventListener('resize', getSectionsY);
    return () => {
      document.removeEventListener('scroll', onScroll);
      document.removeEventListener('resize', getSectionsY);
    };
  }, []);

  const getSectionsY = () => {
    episode.sections.map((section) => {
      const id = idToSectionId(section.id);
      const elem = document.getElementById(id);
      const rect = elem.getBoundingClientRect();
      sectionIdRectTop[section.id] = rect.top;
    });

    effectBeginsHeight = window.innerHeight / 2;
  };

  const getCurrentSectionId = () => {
    const scrollTop = document.documentElement.scrollTop + effectBeginsHeight;
    let cur: { id: string; top: number };
    for (const key in sectionIdRectTop) {
      if (sectionIdRectTop.hasOwnProperty(key)) {
        const top = sectionIdRectTop[key];
        if (top <= scrollTop && (!cur || cur.top < top)) {
          cur = { id: key, top };
        }
      }
    }
    if (!cur) {
      return -1;
    }
    return Number(cur.id);
  };

  let currentMusicID = DEFAULT_CURRENT_MUSIC_ID;

  const sound = new Howl({
    src: ['https://katryomusic.s3.amazonaws.com/lets_dance.mp3'],
    loop: true,
  });

  const playCurrentMusic = () => {
    if (currentMusicID !== DEFAULT_CURRENT_MUSIC_ID) {
      sound.stop(currentMusicID);
      currentMusicID = DEFAULT_CURRENT_MUSIC_ID;
    }
    const id = sound.play();
  };

  const changeBG = async (color: string) => {
    setUpperBGColor(color);
    setUpperBGIn(true);
    await sleep(TRANSITION_MS);
    setLowerBGColor(color);
    setUpperBGIn(false);
  };

  return (
    <div id={ID_STORY_CONTAINER}>
      <div
        style={{
          width: '100%',
          height: '100%',
          left: 0,
          top: 0,
          background: lowerBGColor,
          position: 'fixed',
        }}
      ></div>
      <CSSTransition in={upperBGIn} timeout={TRANSITION_MS} classNames="upper-bg">
        <div
          style={{
            width: '100%',
            height: '100%',
            left: 0,
            top: 0,
            background: upperBGColor,
            position: 'fixed',
          }}
        ></div>
      </CSSTransition>
      <div
        style={{
          margin: '0 auto',
          maxWidth: 700,
          position: 'relative',
          fontSize: 17.5,
          lineHeight: 1.8,
          fontFamily:
            "'游明朝',YuMincho,'ヒラギノ明朝 Pr6N','Hiragino Mincho Pr6N','ヒラギノ明朝 ProN','Hiragino Mincho ProN','ヒラギノ明朝 StdN','Hiragino Mincho StdN',HiraMinProN-W3,'HGS明朝B','HG明朝B',dcsymbols,'Helvetica Neue',Helvetica,Arial,'ヒラギノ角ゴ Pr6N','Hiragino Kaku Gothic Pr6N','ヒラギノ角ゴ ProN','Hiragino Kaku Gothic ProN','ヒラギノ角ゴ StdN','Hiragino Kaku Gothic StdN','Segoe UI',Verdana,'メイリオ',Meiryo,sans-serif",
        }}
      >
        <SectionsList sections={episode.sections} currentPage={currentPage} isPageShowing={isPageShowing} />
      </div>

      <div style={{ position: 'relative' }}>
        <button
          onClick={() => {
            playCurrentMusic();
          }}
        >
          play
        </button>
        <button onClick={() => setPage(1)}>page</button>
        <button onClick={() => changeBG(PINK)}>pink</button>
        <button
          onClick={async () => {
            setUpperBGColor(GREEN);
            setUpperBGIn(true);
            await sleep(TRANSITION_MS);
            setLowerBGColor(GREEN);
            setUpperBGIn(false);
          }}
        >
          green
        </button>
        <button
          onClick={async () => {
            setUpperBGColor(BLUE);
            setUpperBGIn(true);
            await sleep(TRANSITION_MS);
            setLowerBGColor(BLUE);
            setUpperBGIn(false);
          }}
        >
          blue
        </button>
      </div>
    </div>
  );
};

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
