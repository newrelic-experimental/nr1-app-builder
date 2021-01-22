import {
  $,
  storeVariable,
  replaceNestedSubstitutions,
} from '../util'

/*
 * action: join
 * items: jp | null (default: _)
 * delimiter: array | null (default: [])
 * quote: string (default: null)
 * prefix: string (default: null)
 * suffix: string (default: null)
 * store_variable: string | null (default: _)
 */

const join = (action, context) => {
  const items = action.items ? (
      $(context, replaceNestedSubstitutions(action, context, action.items))
    ) : context._,
    delimiter = action.delimiter || ',',
    quote = action.quote || ''
  let prefix = action.prefix || '',
    suffix = action.suffix || ''

  if (items && Array.isArray(items)) {
    storeVariable(
      action,
      context,
      items.map(item => {
        const str = prefix + item + suffix,
          q = quote === 'single' ? "'" : (quote === 'double' ? '"' : '')
        return q ? `${q}${str}${q}` : str
      })
      .join(delimiter)
    )
  }

  return Promise.resolve(context)
}

export default join
