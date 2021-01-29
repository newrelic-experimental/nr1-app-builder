import PromisePool from 'es6-promise-pool'
import { applyActions } from '.'
import {
  $,
  makeError,
  newContext,
  combineContexts,
  replaceNestedSubstitutions,
} from '../util'

const makeItemPromiseGenerator = function* (
  action,
  context,
  items
) {
  for (let index = 0; index < items.length; index += 1){
    const item = items[index],
      aNewContext = newContext(action, context, item)

    aNewContext._index = index
    yield applyActions(aNewContext, action.actions)
  }
}

const sortByIndex = (a, b) => {
  if (a._index < b._index) {
    return -1
  } else if (a._index > b._index) {
    return 1
  }
  return 0
}

const processItems = (action, context, items) => {
  const generator = makeItemPromiseGenerator(
      action,
      context,
      items
    ),
    pool = new PromisePool(generator, 5),
    results = [],
    errors = []

  pool.addEventListener('fulfilled', function (event) {
    results.push(event.data.result)
  })

  pool.addEventListener('rejected', function (event) {
    errors.push(event.data.error)
  })

  return pool.start()
    .then(() => {
      if (errors.length > 0) {
        throw new makeError(errors)
      }

      results.sort(sortByIndex)

      return combineContexts(action, context, results)
    })
}

/*
 * action: each
 * items: jp | null (default: _)
 * as: string | null (default: 'item')
 * flatten: boolean | null (default: true)
 * store_variable: string | null (default: _)
 */

const each = (action, context) => {
  const items = action.items ? (
      $(context, replaceNestedSubstitutions(action, context, action.items))
    ) : context._

  if (Array.isArray(items)) {
    return processItems(action, context, items)
  }

  return Promise.resolve(context)
}

export default each
