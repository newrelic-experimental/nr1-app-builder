import React, { Component } from 'react'
import {
  Stack,
  StackItem,
  Toast,
} from 'nr1'
import runScript from '../runtime'
import NerdGraphClient from '../Nr1NerdGraphClient'
import NerdpackLayoutStandard from './NerdpackLayoutStandard'
import SpinnerView from './SpinnerView'
import ErrorView from './ErrorView'
import EmptyView from './EmptyView'
import OutputWrapper from './OutputWrapper'
import ReportParametersView from './ReportParametersView'
import {
  enrichPlatformState,
  useParamSidebar,
  useUnmanagedParams,
  useParamToolbar,
  validateParameters,
} from '../util'

export default class Shell extends Component {
  constructor(props) {
    super(props)
    this.state = {
      result: null,
      error: null,
      loaded: false,
      loading: false,
      params: null,
    }
  }

  componentDidMount() {
    const {
      config,
      route,
    } = this.props, {
      params
    } = this.state

    if (!config.parameters) {
      this.executeScript(params || {}, route)
    }
  }

  componentDidUpdate(prevProps) {
    if (!this.state.loaded) {
      return
    }

    if (prevProps.route !== this.props.route) {
      this.executeScript(this.state.params, this.props.route)
    } else if (this.platformStateChanged(
      prevProps.platformState,
      this.props.platformState
    )) {
      this.executeScript(this.state.params, this.props.route)
    }
  }

  platformStateChanged(oldPlatformState, newPlatformState) {
    if (oldPlatformState.accountId !== newPlatformState.accountId) {
      return true
    }

    const oldTimeRange = oldPlatformState.timeRange,
      newTimeRange = newPlatformState.timeRange

    if (
      oldTimeRange.begin_time !== newTimeRange.begin_time ||
      oldTimeRange.end_time !== newTimeRange.end_time ||
      oldTimeRange.duration !== newTimeRange.duration
    ) {
      return true
    }

    return oldPlatformState.tvMode !== newPlatformState.tvMode
  }

  executeScript(params = {}, route = null) {
    const {
      config,
      platformState,
    } = this.props

    if (useUnmanagedParams(config)) {
      Object.keys(config.parameters).forEach(key => {
        const element = document.getElementById(key)

        if (element) {
          params[key] = element.value
        }
      })
    }

    const errors = validateParameters(config, params)

    if (errors.length > 0) {
      Toast.showToast({
        title: 'Error details',
        type: Toast.TYPE.CRITICAL,
        description: errors.reduce((accum, msg) => {
          return accum + '\n' + msg
        }, ''),
      })
      return
    }

    this.setState({ loaded: false, loading: true, params }, () => {
      try {
        runScript(
          config,
          route,
          {
            NerdGraphClient: NerdGraphClient,
            variableStore: Object.assign(
              {},
              params,
              enrichPlatformState(platformState),
            )
          }
        )
        .then(result => {
          this.setState({ result, loading: false, loaded: true })
        })
        .catch(err => {
          this.setState({ error: err, loading: false, loaded: true })
        })
      } catch (err) {
        this.setState({ error: err, loading: false, loaded: true })
      }
    })
  }

  render() {
    const {
        config,
        css,
        views,
        route,
      } = this.props, {
        result,
        error,
        loaded,
        loading,
      } = this.state
    let View

    if (loaded) {
      View = (
        !error ? (
          <OutputWrapper
            views={views}
            css={css}
            config={config}
            context={result.context}
            route={route}
            managed={!useUnmanagedParams(config)}
            onRun={() => this.executeScript({}, route)}
          />
        ) : (
          <ErrorView
            heading={config.config && config.config['error-heading']}
            description={config.config && config.config['error-description']}
            error={error}
          />
        )
      )
    } else {
      View = (
        loading ? (
          <SpinnerView
            message="Loading..."
          />
        ) : (
          useUnmanagedParams(config) ? (
            <OutputWrapper
              views={views}
              css={css}
              config={config}
              route={route}
              managed={false}
              onRun={() => this.executeScript({}, route)}
            />
          ) : (
            <EmptyView
              heading="Get started"
              description='Enter data in the fields to the left and click "Apply".'
            />
          )
        )
      )
    }

    return (
      <Stack
        directionType={Stack.DIRECTION_TYPE.VERTICAL}
        horizontalType={Stack.HORIZONTAL_TYPE.FILL}
        fullWidth
        fullHeight
        className="app-shell"
      >
        <StackItem grow className='content-container'>
          <NerdpackLayoutStandard
            toolbar={
              useParamToolbar(config) ? (
                <ReportParametersView
                  params={config.parameters}
                  onRun={params => this.executeScript(params)}
                  toolbar
                />
              ) : null
            }
            sidebar={
              useParamSidebar(config) ? (
                <ReportParametersView
                  params={config.parameters}
                  onRun={params => this.executeScript(params)}
                />
              ) : null
            }
            content={View}
          />
        </StackItem>
      </Stack>
    )
  }
}
