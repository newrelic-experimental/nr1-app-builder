import Inspector, { chromeLight } from 'react-inspector'
import {
  $,
  storeComponent,
} from '../util'

/*
 * action: render-object:
 * at: string || null (default: context.task_name)
 * data: jp | null (default: _)
 */

const renderObject = (action, context) => {
  const _ = context._
  let data = _ ? _ : null

  if (action.data) {
    data = action.data
    if (typeof (data) === 'string') {
      data = $(context, data)
    }
  }

  if (data) {
    storeComponent(
      action,
      context,
      <div className="object-inspector">
        <Inspector
          data={_}
          theme={{
            ...chromeLight,
            ...({
              BASE_FONT_SIZE: '14px',
              ARROW_FONT_SIZE: 14,
              TREENODE_FONT_SIZE: '14px',
            })
          }}
        />
      </div>,
    )
  }

  return Promise.resolve(context)
}

export default renderObject
