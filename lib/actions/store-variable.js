import {
  $,
  matchPath,
  replaceSubstitutions,
  applyFunctionToProperties
} from '../util'

/*
 * action: store-variable
 * name: string
 * value: jp | object (child props) | string
 * at: jp | null (default: root of current context)
 */

const storeVariable = (action, context) => {
  const name = action.name || '_',
    value = action.value,
    at = action.at
  let store = context

  if (at) {
    const obj = $(context, at)
    if (!obj) {
      console.warn(`store-variable destination ${at} is null. Storing at root.`)
    } else if (typeof obj !== 'object') {
      console.warn(`store-variable destination ${at} is not an object. Storing at root.`)
    } else {
      store = obj
    }
  }

  if (typeof value === 'string') {
    store[name] = replaceSubstitutions(action, context, value)
  } else if (typeof value === 'object') {
    store[name] = applyFunctionToProperties(
      value,
      val => {
        const match = matchPath(val)
        return match ? (
            $(context, val)
          ) : (
            replaceSubstitutions(action, context, val)
          )
      },
      true
    )
  }

  return Promise.resolve(context)
}

export default storeVariable
