import React from 'react';
import {
    Stack,
    StackItem,
} from 'nr1'
import YAML from 'yaml'
import ShellView from '../lib/components/ShellView'
import ErrorView from '../lib/components/ErrorView'
import SpinnerView from '../lib/components/SpinnerView'
import appJs from './index'

export default class App extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      config: null,
      error: null,
    }
  }

  componentDidMount() {
    let config, error

    try {
      config = YAML.parse(appJs.config)
    } catch (err) {
      error = err
    }

    if (error) {
      this.setState({ error })
      return
    }

    this.setState({ config, error })
  }

  render() {
    const {
      config,
      error,
    } = this.state
    let View

    if (error) {
      View = (
        <ErrorView
          error={error}
        />
      )
    } else {
      View = config ? (
        <ShellView
          config={config}
          views={appJs.views}
          css={appJs.css}
        />
      ) : (
        <SpinnerView
          message="Loading..."
        />
      )
    }

    return (
      <Stack
        directionType={Stack.DIRECTION_TYPE.HORIZONTAL}
        verticalType={Stack.VERTICAL_TYPE.TOP}
        gapType={Stack.GAP_TYPE.LARGE}
        fullWidth
        fullHeight
      >
        <StackItem grow className="app-wrapper">
          {View}
        </StackItem>
      </Stack>
    )
  }
}
