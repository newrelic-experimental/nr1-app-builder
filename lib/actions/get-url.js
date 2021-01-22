import YAML from 'yaml'
import {
  storeVariable
} from '../util'

const processBody = async (init, response) => {
  const contentType = response.headers.get('Content-Type')

  if (/(?:application|text)\/json/gi.test(contentType)) {
    return await response.json()
  }

  if (/(?:application|text)\/yaml/gi.test(contentType)) {
    return YAML.parse(await response.text())
  }

  return response.text()
}

const doFetch = async (action, context) => {
  const init = Object.assign({}, action),
    headers = init.headers || {}

  if (!headers['Accept'] && !headers['accept']) {
    headers['Accept'] = 'application/json'
  }

  init.headers = headers

  let response = await fetch(action.url, init)

  if (context.verbose) {
    console.log(response)
  }

  if (!response.ok) {
    throw new Error(`Fetch for ${action.url} failed with response code ${response.status} and message ${response.statusText}`)
  }

  return await processBody(init, response)
}

/*
 * action: get-url
 * url: string
 * store_variable: string | null (default: _)
 *
 * Any other options are passed directly through to the fetch() call.
 */

const getUrl = (action, context) => {
  return doFetch(action, context)
    .then(data => {
      return storeVariable(
        action,
        context,
        data,
        'response',
        true
      )
    })
}

export default getUrl
