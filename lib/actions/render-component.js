import {
  storeComponent,
} from '../util'
import Components from '../components/third-party'

/*
 * action: render-component
 * at: string || null (default: context.task_name)
 * type: string
 */

const renderComponent = (action, context) => {
  if (action.type && Components[action.type]) {
    const Cmpnt = Components[action.type]

    storeComponent(
      action,
      context,
      <Cmpnt action={action} context={context} />
    )
  }

  return Promise.resolve(context)
}

export default renderComponent
