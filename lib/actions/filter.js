import {
  $,
  storeVariable,
  newContext,
  replaceNestedSubstitutions,
} from '../util'

const isSelected = (action, context) => {
  const selector = action.include || action.exclude,
    results = $(context, replaceNestedSubstitutions(action, context, selector))

  if (context.verbose) {
    results ?
     console.log(`Selector ${selector} matched`) :
     console.log(`Selector ${selector} did not match`)
  }

  if (!results) {
    return action.include ? false : true
  } else if (Array.isArray(results)) {
    return action.include ? results.length > 0 : results.length === 0
  }

  return action.include ? true : false
}

/*
 * action: filter
 * items: jp | null (default: _)
 * include: jp | null
 * exclude: jp | null
 * store_variable: string | null (default: _)
 *
 * One of include or exclude is required.
 */

const filter = (action, context) => {
  const items = action.items ? (
    $(context, replaceNestedSubstitutions(action, context, action.items))
  ) : context._

  if (items && Array.isArray(items)) {
    storeVariable(
      action,
      context,
      items.filter(item => {
        const aNewContext = newContext(action, context, item)
        return isSelected(action, aNewContext)
      })
    )
  }

  return Promise.resolve(context)
}

export default filter
