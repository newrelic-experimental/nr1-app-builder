import {
  storeVariable
} from '../util'

const storeResponse = (action, context, res) => {
  if (action.store_variable) {
    return storeVariable(action, context, res)
  }

  storeVariable(action, context, res)
  storeVariable(action, context, res.entities, 'entities')

  return context
}

/*
 * action: get-entities
 * guids: array of string guids
 * name: name of entity
 * domain: domain of entities
 * type: type of entities
 * store_variable: string | null (default: _)
 *
 * Any other options are passed directly through to the nerdgraph client.
 */

const getEntities = (action, context) => {
  if (action.guids) {
    return context.nerdGraphClient.getEntitiesByGuids(action.guids, action)
      .then(res => storeResponse(action, context, res))
  } else if (action.name) {
    return context.nerdGraphClient.getEntitiesByName(action.name, action)
      .then(res => storeResponse(action, context, res))
  } else if (action.domain && action.type) {
    return context.nerdGraphClient.getEntitiesByDomainAndType(
      action.domain,
      action.type,
      action,
    )
      .then(res => storeResponse(action, context, res))
  }

  return Promise.resolve(context)
}

export default getEntities
