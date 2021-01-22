import getEntities from './get-entities'
import getUrl from './get-url'
import runNrql from './run-nrql'
import runGql from './run-gql'
import renderChart from './render-chart'
import renderObject from './render-object'
import renderComponent from './render-component'
import map from './map'
import filter from './filter'
import each from './each'
import join from './join'
import sort from './sort'
import {
  applyFunctionToProperties
} from '../util'

const functions = {
  'get-entities': getEntities,
  'get-url': getUrl,
  'run-nrql': runNrql,
  'run-gql': runGql,
  'render-chart': renderChart,
  'render-object': renderObject,
  'render-component': renderComponent,
  'map': map,
  'filter': filter,
  'each': each,
  'join': join,
  'sort': sort,
}

const transformers = [
  'map',
  'filter',
  'each',
  'join',
  'sort',
]

const applyTransformations = (resolve, reject, action, context, index = 0) => {
  if (index === transformers.length) {
    resolve(context)
    return
  }

  const actionName = transformers[index]

  if (action[actionName]) {
    functions[actionName](action[actionName], context)
      .then(newContext => applyTransformations(
        resolve,
        reject,
        action,
        newContext,
        index + 1
      ))
      .catch(err => reject(err))
    return
  }

  applyTransformations(resolve, reject, action, context, index + 1)
}

const wrap = fn => (action, context) => {
  return new Promise((resolve, reject) => {
    console.log(`--------> Running action ${fn.name}`)
    console.log('Current context:')
    console.log(Object.assign({}, context))

    fn(action, context)
      .then(context => applyTransformations(resolve, reject, action, context))
      .catch(err => reject(err))
  })
}

const performAction = (resolve, reject, actions, context, index = 0) => {
  if (index === actions.length) {
    resolve(context)
    return
  }

  const action = actions[index],
    handler = actionHandlers[action.action]

  if (handler) {
    handler(action, context)
      .then(newContext => {
        performAction(resolve, reject, actions, newContext, index + 1)
      })
      .catch(err => {
        reject(err)
      })
    return
  }

  performAction(resolve, reject, actions, index + 1, context)
}

export const applyActions = (context, actions) => {
  return new Promise((resolve, reject) => {
    performAction(resolve, reject, actions, context)
  })
}

const actionHandlers = applyFunctionToProperties(functions, wrap)

export default actionHandlers
