import PromisePool from 'es6-promise-pool'
import {
  $,
  makeError,
  newContext,
  storeVariable,
  applyFunctionToProperties,
} from '../util'

const getItems = (action, context) => {
  if (!action.items) {
    return null
  }

  const items = $(context, action.items)

  if (Array.isArray(items)) {
    return items
  } else if (items) {
    return [ items ]
  }

  return null
}

const executeGql = (action, context, query) => {
  let variables = {}

  if (action.variables) {
    variables = applyFunctionToProperties(
      action.variables,
      value => {
        return $(context, value)
      },
      true
    )
  }

  if (context.verbose) {
    console.log(`Running GQL:`, query)
  }

  return context.nerdGraphClient.executeGql(
    query,
    Object.assign({}, context, variables),
    {}
  )
}

const makeGenerator = function* (
  action,
  context,
  query
) {
  yield executeGql(action, context, query)
}

const makeItemPromiseGenerator = function* (
  action,
  context,
  items,
  query
) {
  for (let item of items){
    const aNewContext = newContext(action, context, item)

    yield executeGql(action, aNewContext, query).then(result => {
      result.item = item
      return result
    })
  }
}

/*
 * action: run-gql
 * items: jp | null
 * query: string (required)
 * variables: object | null
 */

const runGql = (action, context) => {
  const items = getItems(action, context)
  let generator

  if (items) {
    generator = makeItemPromiseGenerator(
      action,
      context,
      items,
      action.query
    )
  } else {
    generator = makeGenerator(action, context, action.query)
  }

  const pool = new PromisePool(generator, 5),
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

      return results.map(res => {
        if (context.verbose) {
          console.log('GQL Result:')
          console.log(res)
        }

        return res
      })
    })
    .then(combinedResults => (
      storeVariable(
        action,
        context,
        combinedResults.length === 1 ? combinedResults[0] : combinedResults,
        'results',
        true
      )
    ))
}

export default runGql
