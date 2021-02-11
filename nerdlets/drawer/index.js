import React, { Component } from 'react';
import {
  navigation,
  NerdletStateContext,
  PlatformStateContext,
  Stack,
  UserStorageQuery,
} from 'nr1'
import YAML from 'yaml'
import ErrorView from '../../lib/components/ErrorView'
import ShellView from '../../lib/components/ShellView'
import SpinnerView from '../../lib/components/SpinnerView'

class DrawerOutputView extends Component {
  constructor(props) {
    super(props)
    this.state = {
      loading: true,
      error: null,
    }
    this.handleOpenStackedRoute = this.handleOpenStackedRoute.bind(this)
  }

  componentDidMount() {
    UserStorageQuery.query({
      collection: 'app-builder-tmp',
      documentId: 'app-src',
    })
    .then(({ data }) => {
      let config, views

      try {
        config = YAML.parse(data.config)
        views = JSON.parse(data.views)
      } catch (error) {
        throw error
      }

      this.setState({
        loading: false,
        config: config,
        views: views,
        css: data.css,
      })
    })
    .catch(error => {
      this.setState({
        loading: false,
        error: error,
      })
    })
  }

  handleOpenStackedRoute(params) {
    const {
      config,
      views,
      css,
    } = this.state

    UserStorageMutation.mutate({
      actionType: UserStorageMutation.ACTION_TYPE.WRITE_DOCUMENT,
      collection: 'app-builder-tmp',
      documentId: 'app-src',
      document: {
        config: YAML.stringify(config),
        views: JSON.stringify(views),
        css: css,
      },
    })
    .then(() => {
      navigation.openStackedNerdlet({
        id: 'drawer',
        urlState: params,
      })
    })
  }

  render() {
    const {
        loading,
        config,
        views,
        css,
        error,
      } = this.state, {
        route
      } = this.props

    return (
      <Stack
        directionType={Stack.DIRECTION_TYPE.VERTICAL}
        verticalType={Stack.VERTICAL_TYPE.TOP}
        gapType={Stack.GAP_TYPE.LARGE}
        fullWidth
        fullHeight
      >
        {
          loading ? (
            <SpinnerView
              message="Loading..."
            />
          ) : (
            error ? (
              <ErrorView
                error={error}
              />
            ) : (
              <ShellView
                config={config}
                views={views}
                css={css}
                onOpenStackedRoute={this.handleOpenStackedRoute}
              />
            )
          )
        }
      </Stack>
    )
  }
}

export default class DrawerNerdlet extends React.Component {
  constructor(props) {
    super(props)
  }

  render() {
    return (
      <PlatformStateContext.Consumer>
        {
          platformState => (
            <NerdletStateContext.Consumer>
              {
                nerdletState => {
                  const {
                    route,
                  } = nerdletState

                  return (
                    <DrawerOutputView
                      { ...this.props }
                      route={route}
                    />
                  )
                }
              }
            </NerdletStateContext.Consumer>
          )
        }
      </PlatformStateContext.Consumer>
    )
  }
}
