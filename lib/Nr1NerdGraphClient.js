/* eslint-disable no-console */
import {
  EntitiesByGuidsQuery,
  EntitiesByNameQuery,
  EntitiesByDomainTypeQuery,
  NrqlQuery,
  NerdGraphQuery,
} from 'nr1'
import { makeError } from './util'

export default class NerdGraphClient {
  constructor(debug = false) {
    this.debug = debug
  }

  async getEntitiesByName(name, options = {}) {
    const res = await EntitiesByNameQuery.query({
      name: name,
      includeTags: (
        options.includeTags !== undefined ? options.includeTags: true
      ),
      filters: options.filters || [],
    })

    if (res.errors) {
      throw makeError(res.errors)
    }

    return res.data
  }

  async getEntitiesByGuids(guids, options = {}) {
    const res = await EntitiesByGuidsQuery.query({
      entityGuids: guids,
      includeTags: options.includeTags !== undefined ? options.includeTags: true
    })

    if (res.errors) {
      throw makeError(res.errors)
    }

    return res.data
  }

  async getEntitiesByDomainAndType(domain, type, options = {}) {
    const res = await EntitiesByDomainTypeQuery.query({
      entityDomain: domain,
      entityType: type,
      includeTags: options.includeTags !== undefined ? options.includeTags : true
    })

    if (res.errors) {
      throw makeError(res.errors)
    }

    return res.data
  }

  async executeNrql(accountId, nrql, options = {}) {
    return NrqlQuery.query({
      accountId: accountId,
      query: nrql,
      formatType: (
        options.raw ? NrqlQuery.FORMAT_TYPE.RAW : NrqlQuery.FORMAT_TYPE.CHART
      ),
    })
  }

  async executeGql(query, variables, options = {}) {
    const res = await NerdGraphQuery.query({
      query,
      variables,
    })

    if (res.errors) {
      throw makeError(res.errors)
    }

    return res.data
  }
}
