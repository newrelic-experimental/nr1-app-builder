import {
  $,
  storeVariable,
  replaceNestedSubstitutions,
} from '../util'

/*
 * action: sort
 * items: jp | null (default: _)
 * by: jp (required)
 * store_variable: string | null (default: _)
 */

const sort = (action, context) => {
  const items = action.items ? (
      $(context, replaceNestedSubstitutions(action, context, action.items))
    ) : context._,
    by = action.by

  if (items && Array.isArray(items)) {
    const sortedItems = items.map((item, index) => ({
        value: $(item, by),
        index: index,
      })).sort((_this, that) => {
        if (_this.value < that.value) {
          return -1
        } else if (_this.value > that.value) {
          return 1
        }
        return 0
      })

    storeVariable(
      action,
      context,
      sortedItems.map(({ index }) => items[index])
    )
  }

  return Promise.resolve(context)
}

export default sort
