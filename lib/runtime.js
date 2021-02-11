import { applyActions } from './actions'
import {
  newContext,
  initializeParameters,
} from './util'

const performTasks = (resolve, reject, config, route = null, index = 0, context = {}) => {
  if (!route) {
    route = (config.config && config.config.default_route) || 'home'
  }

  const controller = config.app[route]

  if (!controller) {
    console.warn(`No controller found for route ${route}`)
    resolve({ config, context })
    return
  }

  const actions = controller.actions

  if (!actions) {
    console.warn(`No actions were found for route ${route}`)
    resolve({ config, context })
    return
  }

  console.log(`========> Executing route ${route}`)

  context.task_name = route
  context.components = []

  applyActions(context, actions)
  .then(newContext => {
    console.log('Final context: ', context)
    resolve({ config, context: newContext })
    return
  })
  .catch(err => {
    console.error(err)
    reject(err)
  })
}

const processGlobals = (config, env) => {
  let context = newContext()

  context.name = config.name

  if (config.config) {
    context = Object.assign(context, config.config)
  }

  if (env.variableStore) {
    context = Object.assign(context, env.variableStore)
  }

  if (config.variable_store) {
    context = Object.assign(context, config.variable_store)
  }

  initializeParameters(config, context)

  context.nerdGraphClient = new env.NerdGraphClient(context.verbose)

  return context
}

export default function runScript(config, route, env) {
  return new Promise((resolve, reject) => {
    const context = processGlobals(config, env)

    performTasks(resolve, reject, config, route, 0, context)
  })
}
