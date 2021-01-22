import { JSONPath } from 'jsonpath-plus'
import camelCase from 'camelcase'

const errorToString = error => {
  if (Array.isArray(error)) {
    return error.reduce((accum, curr, index) => {
      if (index > 1) {
        accum += ', '
      }
      return accum + errorToString(curr)
    }, '')
  } else if (error instanceof Error) {
    return error.message
  } else if (typeof error === 'string') {
    return error
  }
  return JSON.stringify(error)
}

export const makeError = errors => {
  const error = new Error()

  error.message = errorToString(errors)
  error.cause = errors

  return error
}

export const makeNumber = val => {
  return (
    typeof val === 'number'
      ? val
      : new Number(val).valueOf()
  )
}

export const applyFunctionToProperties = (obj, fn, newObj = false) => {
  const destObj = newObj ? {} : obj
  Object.keys(obj).forEach(key => {
    destObj[key] = fn(obj[key])
  })
  return destObj
}

export const $ = (context, path) => {
  if (!path || path.length === 0) {
      return null
  }

  if (path === '_') {
    return context._
  }

  let match = /^[$][{]([^}]+)[}]([\[]([\d]+|[*])[\]])?$/.exec(path)

  if (!match) {
    match = /^[$][\[]([^\]]+)[\]]([\[]([\d]+|[*])[\]])?$/.exec(path)
    if (!match) {
      return null
    }
  }

  // let index = 0

  path = '$.' + match[1]

  /*
  if (match[2]) {
    index = match[3]
  }
  */

  const items = JSONPath({
    path: path,
    json: context,
    wrap: false,
  })

  if (context.verbose) {
    console.log('JsonPath Lookup')
    console.log(`Path: ${path}`)
    console.log('Result')
    console.log(items)
  }

  /*
  if (index === null || index === '*') {
    return items
  }

  return index < items.length ? items[index] : null
  */

  return items
}

const reservedKeys = [
  'name',
  '_',
  'nerdGraphClient',
  'debug',
  'components',
]

export const storeVariable = (
  action,
  context,
  value,
  alt = null,
  alwaysDefault = false
) => {
  if (action.store_variable) {
    context[action.store_variable] = value
  } else if (alt) {
    if (Array.isArray(alt)) {
      alt.forEach(key => context[key] = value)
    } else {
      context[alt] = value
    }
    if (alwaysDefault) {
      context._ = value
    }
  } else {
    context._ = value
  }
  return context
}

// Oh Cmpnt. I miss you WCM.

export const storeComponent = (
  action,
  context,
  cmpnt,
) => {
  context.components.push({
    name: action.at || context.task_name,
    content: cmpnt,
  })

  return context
}

const replaceByPattern = (action, context, pattern, value) => {
  let start = 0,
    newValue = '',
    match

  if (context.verbose) {
    console.log(`Replacing in ${value}`)
  }

  while (match = pattern.exec(value)) {
    const val = $(context, match[0])

    if (val === undefined || val === null) {
      continue
    }

    if (match.index === 0 && pattern.lastIndex === value.length) {
      if (context.verbose) {
        console.log('Result:', val)
      }
      return val
    }

    const replacement = (typeof val === 'string' ? val : val.toString())

    newValue += value.substring(start, match.index)
    newValue += replacement
    start = pattern.lastIndex
  }

  if (start < value.length) {
    newValue += value.substring(start)
  }

  if (context.verbose) {
    console.log('Result:', newValue)
  }

  return newValue
}

export const replaceSubstitutions = (action, context, value) => {
  return replaceByPattern(action, context, /[$][{][^}]+[}]/g, value)
}

export const replaceNestedSubstitutions = (action, context, value) => {
  return replaceByPattern(action, context, /[$][\[][^\]]+[\]]/g, value)
}

export const newContext = (action = null, context = null, item = null) => {
  const aNewContext = context ? Object.assign({}, context) : {}

  if (action && item) {
    aNewContext[action.as || 'item'] = item
  }

  aNewContext._ = null

  return aNewContext
}

export const combineContexts = (action, context, otherContexts) => {
  let __ = []

  otherContexts.forEach(otherContext => {
    Object.keys(otherContext).forEach(key => {
      if (!context[key] && !reservedKeys.includes(key)) {
        context[key] = otherContext[key]
      }
    })

    if (otherContext._) {
      __.push(otherContext._)
    }
  })

  if (action.flatten === undefined || action.flatten) {
    __ = __.flat()
  }

  return storeVariable(
    action,
    context,
    __
  )
}

export const maybeAddTimeRange = (action, context, query) => {
  if (/SINCE/i.test(query) || /UNTIL/i.test(query)) {
    return query
  }
  return `${query} ${context.timeRange.since} ${context.timeRange.until}`
}

export const modifyQuery = (action, context, query) => maybeAddTimeRange(
    action,
    context,
    replaceSubstitutions(action, context, query)
    .replace(/[\\]([^rnt])/g, '\\\\$1')
  )

export const parseAccountIds = (action, context, accountId) => {
  if (!accountId) {
    return null
  }

  if (Array.isArray(accountId)) {
    return accountId.length > 0 ? accountId : null
  } else if (typeof (accountId) === 'number') {
    return [ accountId ]
  } else if (typeof (accountId) === 'string') {
    const objs = $(context, accountId)
    if (Array.isArray(objs)) {
      return objs.length > 0 ? objs : null
    } else if (objs) {
      return [ makeNumber(objs) ]
    }
  }

  return null
}

export const propsToCamel = obj => {
  const newObj = {}

  for (let prop in obj) {
    newObj[camelCase(prop)] = obj[prop]
  }

  return newObj
}

export const initializeParameters = (config, context) => {
  if (!config.parameters) {
    return
  }

  const {
      parameters
    } = config,
    keys = Object.keys(parameters)

  keys.forEach(key => {
    const param = parameters[key]

    if (param.default) {
      context[key] = param.default
    }
  })

  return context
}

export const validateParameters = (config, params) =>  {
  if (!config.parameters) {
    return []
  }

  const {
      parameters
    } = config,
    keys = Object.keys(parameters),
    errors = []

  keys.forEach(key => {
    const param = parameters[key]

    if (param.required) {
      if (!params[key]) {
        const label = param.label || key
        errors.push(`Missing value for parameter ${label}`)
      }
    }
  })

  return errors
}

export const useUnmanagedParams = config => {
  if (!config.parameters) {
    return false
  }

  if (!config.config || !config.config.parameters) {
    return false
  }

  return config.config.parameters.form !== undefined &&
    !config.config.parameters.form
}

export const useParamToolbar = config => {
  if (!config.parameters) {
    return false
  }

  if (useUnmanagedParams(config)) {
    return false
  }

  return (
    config.config &&
    config.config.parameters &&
    config.config.parameters.toolbar
  )
}

export const useParamSidebar = config => {
  if (!config.parameters) {
    return false
  }

  if (useUnmanagedParams(config)) {
    return false
  }

  if (!config.config || !config.config.parameters) {
    return true
  }

  return config.config.parameters.toolbar === undefined ||
    !config.config.parameters.toolbar
}

export const enrichPlatformState = platformState => {
  if (!platformState.timeRange) {
    return {
      ...platformState,
      timeRange: {
        begin_time: null,
        duration: 1800000,
        end_time: null,
        since: 'SINCE 30 MINUTES AGO',
        until: '',
      }
    }
  }

  function padNum(num) {
    if (num < 10) {
      return `0${num}`
    }
    return `${num}`
  }

  function dateStr(date) {
    return `${date.getUTCFullYear()}-${padNum(date.getUTCMonth() + 1)}-${padNum(date.getUTCDate())}`
  }

  function timeStr(date) {
    return `${padNum(date.getUTCHours())}:${padNum(date.getUTCMinutes() + 1)}:${padNum(date.getUTCSeconds())}`
  }

  function dateTimeStr(date) {
    return `${dateStr(date)} ${timeStr(date)}`
  }

  const {
      begin_time,
      duration,
      end_time,
    } = platformState.timeRange,
    enrichedPlatformState = { ...platformState }

  enrichedPlatformState.timeRange.since = 'SINCE 30 MINUTES AGO'
  enrichedPlatformState.timeRange.until = ''

  if (begin_time > 0 && end_time > 0) {
    const begin = new Date(), end = new Date()

    begin.setTime(begin_time)
    end.setTime(end_time)

    enrichedPlatformState.timeRange.since
      = `SINCE '${dateTimeStr(begin)}'`
    enrichedPlatformState.timeRange.until
      = `UNTIL '${dateTimeStr(end)}'`
  } else if (duration > 0) {
    enrichedPlatformState.timeRange.since
      = `SINCE ${duration / 1000 / 60} MINUTES AGO`
    enrichedPlatformState.timeRange.until = ''
  }

  return enrichedPlatformState
}

