import { CSSTransition } from 'react-transition-group'
import { useState } from 'react'

const WHITE = '#ffffff'
const PINK = '#fecbc8'
const BLUE = '#dceff5'

const BackgroundContainer = () => {
  const [lowerBGColor, setLowerBGColor] = useState(WHITE)
  const [upperBGColor, setUpperBGColor] = useState(WHITE)

  const [upperBGIn, setUpperBGIn] = useState(true)

  const sleep = async (ms: number) => {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  return (
    <div>
      <div
        style={{
          width: '100%',
          height: '100%',
          left: 0,
          top: 0,
          background: lowerBGColor,
          position: 'fixed',
        }}></div>
      <CSSTransition in={upperBGIn} timeout={2000} classNames='upper-bg'>
        <div
          style={{
            width: '100%',
            height: '100%',
            left: 0,
            top: 0,
            background: upperBGColor,
            position: 'fixed',
          }}></div>
      </CSSTransition>
      <div style={{ position: 'relative' }}>
        <button
          onClick={async () => {
            setLowerBGColor(PINK)
            setUpperBGIn(false)
            await sleep(2000)
            setUpperBGColor(PINK)
            setUpperBGIn(true)
          }}>
          pink
        </button>
        <button
          onClick={async () => {
            setLowerBGColor(BLUE)
            setUpperBGIn(false)
            await sleep(2000)
            setUpperBGColor(BLUE)
            setUpperBGIn(true)
          }}>
          blue
        </button>
        <button
          onClick={() => {
            setUpperBGIn(false)
          }}>
          setUpperBGIn(false);
        </button>
        <p>本文</p>
        <p>本文</p>
        <p>本文</p>
        <p>本文</p>
        <p>本文</p>
        <p>本文</p>
        <p>本文</p>
      </div>
    </div>
  )
}

const Demo = () => {
  return (
    <div>
      <BackgroundContainer />
    </div>
  )
}

export default Demo
