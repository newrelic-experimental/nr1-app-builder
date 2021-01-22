import PromisePool from 'es6-promise-pool'
import {
  $,
  makeNumber,
  makeError,
  newContext,
  storeVariable,
  modifyQuery,
  parseAccountIds,
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

const makeAccountIdPromiseGenerator = function* (
  action,
  context,
  accounts,
  query,
  raw
) {
  for (let accountId of accounts){
    const aNewContext = newContext(action, context, accountId),
      nrql = modifyQuery(action, aNewContext, query)

    if (aNewContext.verbose) {
      console.log(`Running NRQL on ${accountId}:`, nrql)
    }

    yield aNewContext.nerdGraphClient.executeNrql(
      accountId,
      nrql,
      { raw }
    ).then(result => {
      result.item = accountId
      return result
    })
  }
}

const makeItemPromiseGenerator = function* (
  action,
  context,
  items,
  query,
  raw
) {
  const accountIds = parseAccountIds(action, context, action.account_id)

  for (let item of items){
    const aNewContext = newContext(action, context, item),
      nrql = modifyQuery(action, aNewContext, query),
      accountId = accountIds && accountIds.length > 0
        ? accountIds[0]
        : makeNumber(item.accountId)

    if (aNewContext.verbose) {
      console.log(`Running NRQL on ${accountId}:`, nrql)
    }

    yield aNewContext.nerdGraphClient.executeNrql(
      accountId,
      nrql,
      { raw }
    ).then(result => {
      result.item = item
      return result
    })
  }
}

/*
 * action: run-nrql
 * account_id: jp | array | null
 * items: jp | null
 * query: string (required)
 * raw: boolean
 */

const runNrql = (action, context) => {
  const raw = action.raw !== undefined && action.raw,
    items = getItems(action, context)
  let generator

  if (items) {
    generator = makeItemPromiseGenerator(
      action,
      context,
      items,
      action.query,
      raw
    )
  } else {
    const accountIds = parseAccountIds(action, context, action.account_id)

    if (accountIds && accountIds.length > 0) {
      generator = makeAccountIdPromiseGenerator(
        action,
        context,
        accountIds,
        action.query,
        raw
      )
    }
  }

  if (!generator) {
    return Promise.resolve(context)
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
        if (res.data.error) {
          throw res.data.error
        }

        if (context.verbose) {
          console.log('NRQL Result:')
          console.log(res.data)
        }

        const result = res.data

        result.item = res.item

        return result
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

export default runNrql
