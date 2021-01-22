import {
  $,
  applyFunctionToProperties,
  storeVariable,
  replaceSubstitutions,
  replaceNestedSubstitutions,
} from '../util'

const objectMaker = action => {
  const to = action.to
  if (typeof to === 'string') {
    return (context, item) => {
      context.item = item
      return replaceSubstitutions(action, context, to)
    }
  }

  return (context, item) => {
    context.item = item
    return applyFunctionToProperties(
      to,
      value => {
        return $(context, value)
      },
      true
    )
  }
}

/*
 * action: map
 * to: string | object (child props)
 * from: jp | null (default: _)
 * store_variable: string | null (default: _)
 */

const map = (action, context) => {
  const items = action.from ? (
      $(context, replaceNestedSubstitutions(action, context, action.from))
    ) : context._,
    makeObject = objectMaker(action)

  if (items && Array.isArray(items)) {
    storeVariable(
      action,
      context,
      items.map(item => {
        return makeObject(context, item)
      })
    )
  }

  return Promise.resolve(context)
}

export default map
