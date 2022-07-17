const PLAIN = 'PLAIN';
const RUBY = 'RUBY';

const DEFAULT_IDX = -1;
interface PlainElement {
  type: typeof PLAIN;
  plainText: string;
}

interface RubyElement {
  type: typeof RUBY;
  baseText: string;
  rubyText: string;
}

type TextElement = PlainElement | RubyElement;

interface Props {
  elements: TextElement[];
  baseStartIdx: number;
  rubyStartIdx: number;
  lastRubyEndIdx: number;
}

type Action = (char: string, props: Props, i: number, text: string) => Props;

const noOpAction: Action = (char: string, props: Props, i: number, text: string) => {
  return props;
};

const baseStartAction: Action = (char: string, props: Props, i: number, text: string) => {
  if (props.baseStartIdx !== DEFAULT_IDX) {
    return props;
  }
  if (props.rubyStartIdx !== DEFAULT_IDX) {
    return props;
  }
  props.baseStartIdx = i;
  return props;
};

const rubyStartAction: Action = (char: string, props: Props, i: number, text: string) => {
  if (props.baseStartIdx === DEFAULT_IDX) {
    return props;
  }
  if (props.rubyStartIdx !== DEFAULT_IDX) {
    return props;
  }
  props.rubyStartIdx = i;
  return props;
};

const rubyEndAction: Action = (char: string, props: Props, i: number, text: string) => {
  if (props.baseStartIdx === DEFAULT_IDX) {
    return props;
  }
  if (props.rubyStartIdx === DEFAULT_IDX) {
    return props;
  }
  const plainElem: PlainElement = {
    type: PLAIN,
    plainText: text.slice(props.lastRubyEndIdx + 1, props.baseStartIdx),
  };
  if (plainElem.plainText !== '') {
    props.elements.push(plainElem);
  }

  const rubyElem: RubyElement = {
    type: RUBY,
    baseText: text.slice(props.baseStartIdx + 1, props.rubyStartIdx),
    rubyText: text.slice(props.rubyStartIdx + 1, i),
  };
  props.elements.push(rubyElem);

  props.rubyStartIdx = DEFAULT_IDX;
  props.baseStartIdx = DEFAULT_IDX;
  props.lastRubyEndIdx = i;
  return props;
};

const isPlain = (elem: TextElement): elem is PlainElement => {
  return elem.type === PLAIN;
};

const DUMMY_STATE = 'DUMMY_STATE';

interface ActionAndNextState {
  action: Action;
  nextState: State | 'DUMMY_STATE';
}

interface State {
  '|': ActionAndNextState;
  '｜': ActionAndNextState;
  '《': ActionAndNextState;
  '》': ActionAndNextState;
  OTHERS: ActionAndNextState;
}

const INIT_PROPS: Props = {
  elements: [],
  baseStartIdx: DEFAULT_IDX,
  rubyStartIdx: DEFAULT_IDX,
  lastRubyEndIdx: DEFAULT_IDX,
};

const initState: State = {
  '|': { action: baseStartAction, nextState: DUMMY_STATE },
  '｜': { action: baseStartAction, nextState: DUMMY_STATE },
  '《': { action: noOpAction, nextState: DUMMY_STATE },
  '》': { action: noOpAction, nextState: DUMMY_STATE },
  OTHERS: { action: noOpAction, nextState: DUMMY_STATE },
};
initState['《'].nextState = initState;
initState['》'].nextState = initState;
initState.OTHERS.nextState = initState;

const inRubyState: State = {
  '|': { action: noOpAction, nextState: DUMMY_STATE },
  '｜': { action: noOpAction, nextState: DUMMY_STATE },
  '《': { action: noOpAction, nextState: DUMMY_STATE },
  '》': { action: rubyEndAction, nextState: initState },
  OTHERS: { action: noOpAction, nextState: DUMMY_STATE },
};
inRubyState['｜'].nextState = inRubyState;
inRubyState['|'].nextState = inRubyState;
inRubyState['《'].nextState = inRubyState;
inRubyState.OTHERS.nextState = inRubyState;

const inBaseState: State = {
  '|': { action: noOpAction, nextState: DUMMY_STATE },
  '｜': { action: noOpAction, nextState: DUMMY_STATE },
  '《': { action: rubyStartAction, nextState: inRubyState },
  '》': { action: noOpAction, nextState: DUMMY_STATE },
  OTHERS: { action: noOpAction, nextState: DUMMY_STATE },
};
inBaseState['｜'].nextState = inBaseState;
inBaseState['|'].nextState = inBaseState;
inBaseState['》'].nextState = inBaseState;
inBaseState.OTHERS.nextState = inBaseState;

initState['｜'].nextState = inBaseState;
initState['|'].nextState = inBaseState;

const parse = (text: string): TextElement[] => {
  let props = JSON.parse(JSON.stringify(INIT_PROPS));
  let state = initState;

  const step = (char: string, i: number) => {
    let next = char;
    if (!(char in state)) {
      next = 'OTHERS';
    }
    const { action, nextState } = state[next];
    props = action(char, props, i, text); // Passing whole the text is memory consuming?
    if (nextState === DUMMY_STATE) {
      if (i < text.length - 1) {
        throw new Error('DUMMY_STATE.');
      }
    } else {
      state = nextState;
    }
  };

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    step(char, i);
  }

  if (props.lastRubyEndIdx !== text.length - 1) {
    props.elements.push({ type: PLAIN, plainText: text.slice(props.lastRubyEndIdx + 1) });
  }

  return props.elements;
};

export { isPlain, parse };
