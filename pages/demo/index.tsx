import * as ReactCSSTransitionGroup from 'react-addons-css-transition-group'
import { useState } from 'react'

const BackgroundContainer = () => {
  const [colors, setColor] = useState(['blue'])

  const items = colors.map((item, i) => (
    <div key={item}>
      {item} {i}
    </div>
  ))

  return (
    <div>
      <button
        onClick={() => {
          const conc = colors.concat(colors.length.toString())
          setColor(conc)
        }}>
        btn
      </button>
      background
      <ReactCSSTransitionGroup transitionName='example' transitionEnterTimeout={500} transitionLeaveTimeout={300}>
        {items}
      </ReactCSSTransitionGroup>
      <div>{items.length}</div>
    </div>
  )
}

const Demo = () => {
  return (
    <div>
      demo
      <BackgroundContainer />
    </div>
  )
}

export default Demo
