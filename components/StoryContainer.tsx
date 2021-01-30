import { CSSTransition } from 'react-transition-group';
import { Howl, Howler } from 'howler';
import { useState, useEffect, useCallback } from 'react';
import { RubiedParagraph } from './RubiedParagraph';

const TRANSITION_MS = 800;
const PAGE_TRAINSITION_MS = 400;
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

interface IPageId {
  pageId: number;
}

type SectionWithPageId = Section & IPageId;

interface Page {
  sections: Section[];
  id: number;
}

interface ImageMappingItem {
  small: string;
  large: string;
}

interface Episode {
  seriesTitle: string;
  episodeTitle: string;
  creator: string;
  pages: Page[];
  audioMapping: { [key: string]: string };
  imageMapping: { [key: string]: ImageMappingItem };
  colorMapping: { [key: string]: string };
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
      <RubiedParagraph
        text={text}
        key={keyVal}
        style={{
          margin: 0,
        }}
      />
    );
  }
};

const idToSectionId = (id: number) => {
  return `section${id}`;
};

const idToPageId = (id: number) => {
  return `page${id + 1}`;
};

interface SectionIdDist {
  [id: number]: number;
}

const imageInstances = {};
const imageLoaded: { [key: string]: { small: boolean; large: boolean } } = {};

const getVisualSrc = (
  name: string,
  imageMapping: { [key: string]: ImageMappingItem },
  colorMapping: { [key: string]: string },
) => {
  if (name === '') {
    throw new Error(`name is empty.`);
  }
  const color = colorMapping[name];
  if (color) {
    return color;
  }
  const imageMappingItem = imageMapping[name];
  if (!imageMappingItem) {
    throw new Error(`${name} is not found in colorMapping nor imageMapping.`);
  }
  if (imageLoaded[name] && imageLoaded[name].large) {
    return imageMappingItem.large;
  } else {
    return imageMappingItem.small;
  }
};

const SectionList = (props: {
  page: Page;
  textColor: string;
  imageMapping: { [key: string]: ImageMappingItem };
  colorMapping: { [key: string]: string };
}) => {
  const { page, textColor, imageMapping, colorMapping } = props;

  const sectionList = page.sections.map((section) => {
    return (
      <div id={idToSectionId(section.id)} key={section.id} style={{ color: textColor, marginTop: '3rem' }}>
        {section.image !== '' && (
          <img
            src={getVisualSrc(section.image, imageMapping, colorMapping)}
            style={{ width: '100%', marginBottom: '3rem' }}
          />
        )}
        {section.paragraphs.map((paragraph, idx) => {
          const keyVal = `${section.id}-${idx.toString()}`;
          return <Paragraph keyVal={keyVal} key={keyVal} text={paragraph} />;
        })}
      </div>
    );
  });
  return <>{sectionList}</>;
};

const PageList = (props: {
  pages: Page[];
  currentPage: number;
  isPageShowing: boolean;
  textColor: string;
  imageMapping: { [key: string]: ImageMappingItem };
  colorMapping: { [key: string]: string };
}) => {
  const { pages, currentPage, isPageShowing, textColor, imageMapping, colorMapping } = props;
  const pageElements = pages.map((page) => {
    return (
      <CSSTransition
        in={currentPage === page.id && isPageShowing}
        appear={true}
        timeout={TRANSITION_MS}
        classNames="page"
        key={page.id}
        id={idToPageId(page.id)}
      >
        <div className="page-before" style={{ minHeight: '20rem' }}>
          <SectionList page={page} textColor={textColor} imageMapping={imageMapping} colorMapping={colorMapping} />
          <div className="scroll-indicator" style={{ textAlign: 'center', marginTop: '2rem' }}>
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      </CSSTransition>
    );
  });

  return <div>{pageElements}</div>;
};

const StoryContainer = (props: { episode: Episode }) => {
  const { episode } = props;
  const sections: SectionWithPageId[] = episode.pages
    .map((page) => {
      return page.sections.map((section) => {
        return { ...section, pageId: page.id };
      });
    })
    .flat();

  const getColor = (name: string) => {
    if (name === '') {
      throw new Error(`name is empty.`);
    }
    const color = episode.colorMapping[name];
    if (!color) {
      throw new Error(`${name} not found in colorMapping.`);
    }
    return color;
  };

  const defaultBg = getVisualSrc(episode.defaultBg, episode.imageMapping, episode.colorMapping);

  const FULL_SCREEN_STYLE = {
    width: '100%',
    height: '100%',
    left: 0,
    top: 0,
    position: 'fixed' as 'fixed',
    backgroundSize: 'cover' as 'cover',
    backgroundPosition: 'center' as 'center',
  };

  const getBgStyle = (bgName: string) => {
    const style = { ...FULL_SCREEN_STYLE }; // Clone
    if (bgName === '') {
      bgName = episode.defaultBg;
    }
    let src = episode.colorMapping[bgName];
    if (src) {
      style['backgroundColor'] = src;
    } else {
      const imageMappingItem = episode.imageMapping[bgName];
      if (!imageMappingItem) {
        throw new Error(`${bgName} is not found in colorMapping nor imageMapping.`);
      }
      if (imageLoaded[bgName].large) {
        src = `url("${imageMappingItem.large}")`;
      } else {
        src = `url("${imageMappingItem.small}")`;
      }
      style['backgroundImage'] = src;
    }
    return style;
  };

  const [lowerBgStyle, setLowerBgSrc] = useState(getBgStyle(episode.defaultBg));
  const [upperBgStyle, setUpperBgSrc] = useState(getBgStyle(episode.defaultBg));
  const [textColor, setTextColor] = useState(getColor(episode.defaultTextColor));
  const [filterColor, setFilter] = useState(getColor(episode.defaultFilter));
  const [filterIn, setFilterIn] = useState(true);
  const [upperBgIn, setUpperBgIn] = useState(false);
  const [currentPage, setPage] = useState(0);
  const [isPageShowing, setIsPageShowing] = useState(true);
  const [currentBg, setCurrentBg] = useState(defaultBg);
  const ID_STORY_CONTAINER = 'js-story-container';
  const sectionIdDist: SectionIdDist = {};
  const sectionIdIndex: { [id: number]: number } = {};
  let effectBeginsHeight = 500;

  const getSectionsY = () => {
    const storyContainer = document.getElementById(ID_STORY_CONTAINER);
    const storyContainerTop = storyContainer.getBoundingClientRect().top;
    sections.map((section, idx) => {
      const id = idToSectionId(section.id);
      const elem = document.getElementById(id);
      const rect = elem.getBoundingClientRect();
      sectionIdDist[section.id] = rect.top - storyContainerTop;
      sectionIdIndex[section.id] = idx;
    });

    effectBeginsHeight = window.innerHeight / 2;
  };

  const changeFilter = useCallback(
    async (filterName: string) => {
      const color = getColor(filterName);
    },
    [filterColor],
  );

  const changeBg = useCallback(
    async (bgName: string) => {
      const style = getBgStyle(bgName);
      setUpperBgSrc(style);
      setUpperBgIn(true);
      await sleep(TRANSITION_MS);
      setLowerBgSrc(style);
      setUpperBgIn(false);
    },
    [upperBgStyle, lowerBgStyle, upperBgIn],
  );

  const handleScroll = useCallback(
    async (e) => {
      const sectionId = getCurrentSectionId();
      const sectionIndex = sectionIdIndex[sectionId];
      const currentSection = sections[sectionIndex];

      if (currentSection.bg !== currentBg) {
        changeBg(currentSection.bg);
        setCurrentBg(currentSection.bg);
      }

      if (currentSection.pageId !== currentPage) {
        setIsPageShowing(false);
        setPage(currentSection.pageId);
        await sleep(PAGE_TRAINSITION_MS);
        setIsPageShowing(true);
      }
    },
    [currentPage, isPageShowing, currentBg],
  );

  useEffect(() => {
    getSectionsY();

    // preload
    for (const key in episode.imageMapping) {
      if (episode.imageMapping.hasOwnProperty(key)) {
        if (!(key in imageInstances)) {
          const element = episode.imageMapping[key];
          imageInstances[key] = {
            small: new Image(),
            large: new Image(),
          };
          imageLoaded[key] = {
            small: false,
            large: false,
          };
          imageInstances[key].small.onload = () => {
            imageLoaded[key].small = true;
          };
          imageInstances[key].large.onload = () => {
            imageLoaded[key].large = true;
          };
          imageInstances[key].small.src = element.small;
          imageInstances[key].large.src = element.large;
        }
      }
    }

    document.addEventListener('scroll', handleScroll);
    document.addEventListener('resize', getSectionsY);
    return () => {
      document.removeEventListener('scroll', handleScroll);
      document.removeEventListener('resize', getSectionsY);
    };
  });

  const getCurrentSectionId = () => {
    if (sections.length === 0) {
      return -1;
    }
    const firstId = sections[0].id;
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

  return (
    <div id={ID_STORY_CONTAINER} style={{ scrollBehavior: 'smooth' }}>
      <div style={lowerBgStyle}></div>
      <CSSTransition in={upperBgIn} timeout={TRANSITION_MS} classNames="upper-bg">
        <div style={upperBgStyle}></div>
      </CSSTransition>
      <CSSTransition in={filterIn} appear={true} timeout={TRANSITION_MS} classNames="filter">
        <div style={{ ...FULL_SCREEN_STYLE, backgroundColor: filterColor }}></div>
      </CSSTransition>
      <div
        style={{
          margin: '0 auto',
          padding: 20,
          position: 'relative',
          maxWidth: 700,
        }}
      >
        <header style={{ textAlign: 'center' }}>
          <h1
            style={{
              color: getColor(episode.defaultTextColor),
              marginTop: '5rem',
              marginBottom: '5rem',
            }}
          >
            {episode.episodeTitle}
          </h1>
        </header>
        <div
          style={{
            fontSize: 17.5,
            lineHeight: 1.8,
            fontFamily:
              "'游明朝',YuMincho,'ヒラギノ明朝 Pr6N','Hiragino Mincho Pr6N','ヒラギノ明朝 ProN','Hiragino Mincho ProN','ヒラギノ明朝 StdN','Hiragino Mincho StdN',HiraMinProN-W3,'Noto Serif JP','HGS明朝B','HG明朝B',dcsymbols,'Helvetica Neue',Helvetica,Arial,'ヒラギノ角ゴ Pr6N','Hiragino Kaku Gothic Pr6N','ヒラギノ角ゴ ProN','Hiragino Kaku Gothic ProN','ヒラギノ角ゴ StdN','Hiragino Kaku Gothic StdN','Segoe UI',serif",
          }}
        >
          <PageList
            pages={episode.pages}
            currentPage={currentPage}
            isPageShowing={isPageShowing}
            textColor={textColor}
            imageMapping={episode.imageMapping}
            colorMapping={episode.colorMapping}
          />
          <div style={{ width: '100%', marginTop: '30rem' }}>Next episode</div>
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
      </div>
    </div>
  );
};

export { StoryContainer };
