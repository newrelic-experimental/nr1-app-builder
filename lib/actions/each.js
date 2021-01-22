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
  for (let item of items){
    yield applyActions(
      newContext(action, context, item),
      action.actions
    )
  }
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
