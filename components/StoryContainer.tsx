import { CSSTransition } from 'react-transition-group';
import { Howl, Howler } from 'howler';
import { useState, useEffect, useCallback } from 'react';

const WHITE = '#ffffff';
const PINK = '#fecbc8';
const BLUE = '#dceff5';
const GREEN = '#dcfec8';
const TRANSITION_MS = 2000;
const PAGE_TRAINSITION_MS = 500;
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
  page: number;
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
        appear={true}
        timeout={TRANSITION_MS}
        classNames="page"
        key={section.id}
        id={idToSectionId(section.id)}
      >
        <div className="page-before">
          <div>
            {section.paragraphs.map((paragraph, idx) => {
              const keyVal = `${section.id}-${idx.toString()}`;
              return <Paragraph keyVal={keyVal} key={keyVal} text={paragraph} />;
            })}
          </div>
        </div>
      </CSSTransition>
    );
  });

  return <div>{sectionsList}</div>;
};

interface SectionIdDist {
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
  const sectionIdDist: SectionIdDist = {};
  const sectionIdIndex: { [id: number]: number } = {};
  let effectBeginsHeight = 500;

  const getSectionsY = () => {
    const storyContainer = document.getElementById(ID_STORY_CONTAINER);
    const storyContainerTop = storyContainer.getBoundingClientRect().top;
    episode.sections.map((section, idx) => {
      const id = idToSectionId(section.id);
      const elem = document.getElementById(id);
      const rect = elem.getBoundingClientRect();
      // console.log({ idx, sectionId: section.id, rect });
      sectionIdDist[section.id] = rect.top - storyContainerTop;
      sectionIdIndex[section.id] = idx;
    });

    effectBeginsHeight = window.innerHeight / 2;
  };

  const handleScroll = useCallback(
    async (e) => {
      const sectionId = getCurrentSectionId();
      const sectionIndex = sectionIdIndex[sectionId];
      const currentSection = episode.sections[sectionIndex];
      if (currentSection.page !== currentPage) {
        setIsPageShowing(false);
        setPage(currentSection.page);
        await sleep(PAGE_TRAINSITION_MS);
        setIsPageShowing(true);
        // setPage((state) => currentSection.page);
        // console.log('setPage called');
        // console.log({ pageChangedTo: currentSection.page });
      }
    },
    [currentPage, isPageShowing],
  );

  useEffect(() => {
    getSectionsY();

    document.addEventListener('scroll', handleScroll);
    document.addEventListener('resize', getSectionsY);
    return () => {
      document.removeEventListener('scroll', handleScroll);
      document.removeEventListener('resize', getSectionsY);
    };
  });

  const getCurrentSectionId = () => {
    if (episode.sections.length === 0) {
      return -1;
    }
    const firstId = episode.sections[0].id;
    const scrollTop = document.documentElement.scrollTop;
    const cur = { id: firstId, top: 0 };
    for (const key in sectionIdDist) {
      if (sectionIdDist.hasOwnProperty(key)) {
        const topThreshold = sectionIdDist[key] - effectBeginsHeight;
        if (topThreshold <= scrollTop && (!cur || cur.top < topThreshold)) {
          cur.id = Number(key);
          cur.top = topThreshold;
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
        }}
      >
        <h1 style={{ textAlign: 'center' }}>{episode.episodeTitle}</h1>
        <div
          style={{
            fontSize: 17.5,
            lineHeight: 1.8,
            fontFamily:
              "'游明朝',YuMincho,'ヒラギノ明朝 Pr6N','Hiragino Mincho Pr6N','ヒラギノ明朝 ProN','Hiragino Mincho ProN','ヒラギノ明朝 StdN','Hiragino Mincho StdN',HiraMinProN-W3,'HGS明朝B','HG明朝B',dcsymbols,'Helvetica Neue',Helvetica,Arial,'ヒラギノ角ゴ Pr6N','Hiragino Kaku Gothic Pr6N','ヒラギノ角ゴ ProN','Hiragino Kaku Gothic ProN','ヒラギノ角ゴ StdN','Hiragino Kaku Gothic StdN','Segoe UI',Verdana,'メイリオ',Meiryo,sans-serif",
          }}
        >
          <SectionsList sections={episode.sections} currentPage={currentPage} isPageShowing={isPageShowing} />
        </div>
      </div>

      <div style={{ position: 'relative' }}>
        <button
          onClick={() => {
            playCurrentMusic();
          }}
        >
          play
        </button>
        {/* <button onClick={() => setPage(1)}>page</button> */}
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

export { StoryContainer };
