import React, { Component } from 'react'
import {
  nerdlet,
  PlatformStateContext,
  NerdletStateContext,
} from 'nr1'
import Shell from './Shell'

class ShellWrapper extends Component {
  constructor(props) {
    super(props)

    const {
      nerdletState,
      config,
    } = props

    this.state = {
      route: (
        nerdletState.appRoute ||
        (config.config && config.config.default_route) ||
        'home'
      )
    }
  }

  componentDidUpdate(prevProps) {
    if (this.routeChanged(prevProps.nerdletState, this.props.nerdletState)) {
      this.setState({ route: this.props.nerdletState.appRoute })
    }
  }

  routeChanged(oldNerdletState, newNerdletState) {
    if (oldNerdletState.appRoute !== newNerdletState.appRoute) {
      return true
    }

    return false
  }

  render() {
    return (
      <Shell
        { ...this.props }
        route={this.state.route}
      />
    )
  }
}

export default class ShellView extends Component {
  componentDidMount() {
    const {
        config
      } = this.props,
      nerdletConfig = (config.config && config.config.nerdletConfig) || {
          timePicker: true,
          timePickerRanges: [
            ...nerdlet.TIME_PICKER_DEFAULT_RANGES,
          ],
        }

    nerdlet.setConfig(nerdletConfig)
  }

  render() {
    return (
      <PlatformStateContext.Consumer>
        {
          platformState => (
            <NerdletStateContext.Consumer>
              {
                nerdletState => (
                  <ShellWrapper
                    { ...this.props }
                    platformState={platformState}
                    nerdletState={nerdletState}
                  />
                )
              }
            </NerdletStateContext.Consumer>
          )
        }
      </PlatformStateContext.Consumer>
    )
  }
}
