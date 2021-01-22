import React from 'react';
import {
  Stack,
  StackItem,
  Toast,
} from 'nr1'
import { Hook, Decode } from 'console-feed'
import YAML from 'yaml'
import JSZip from 'jszip'
import NerdpackLayoutStandard from '../../lib/components/NerdpackLayoutStandard'
import OutputView from './components/OutputView'
import SidebarView from './components/SidebarView'
import EditModalView from './components/EditModalView'
import examples from '../../examples'

const clickDownloadLink = (url, filename) => {
  let link = document.getElementById('app-builder-offscreen-link')

  if (!link) {
    // Create download link element
    link = document.createElement("a")
    link.setAttribute('id', 'app-builder-offscreen-link')
    link.setAttribute(
      'style',
      'position: absolute; top: -5000px; left: -5000px; width: 612px; height: 792px'
    )
    document.documentElement.appendChild(link)
  }

  link.href = url
  link.download = filename

  link.click()
}

export default class AppBuilderNerdlet extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      config: examples[0].config,
      html: examples[0].views.home,
      css: examples[0].css,
      logs: [],
      renderShell: false,
      activeConfig: null,
      activeHtml: null,
      activeCss: null,
      modalKey: null,
      error: null,
      dirty: false,
    }
    this.handleRunScript = this.handleRunScript.bind(this)
    this.handleValidateScript = this.handleValidateScript.bind(this)
    this.handleDownloadAssets = this.handleDownloadAssets.bind(this)
    this.handleOpenEditModal = this.handleOpenEditModal.bind(this)
    this.handleEditModalChange = this.handleEditModalChange.bind(this)
    this.handleCloseEditModal = this.handleCloseEditModal.bind(this)
    this.handleConfigChange = this.handleConfigChange.bind(this)
    this.handleHtmlChange = this.handleHtmlChange.bind(this)
    this.handleCssChange = this.handleCssChange.bind(this)
    this.handleSelectExample = this.handleSelectExample.bind(this)
    this.handleBeforeUnload = this.handleBeforeUnload.bind(this)
  }

  componentDidMount() {
    window.addEventListener("beforeunload", this.handleBeforeUnload)
    Hook(window.console, log => {
      this.setState(({ logs }) => ({ logs: [...logs, Decode(log)] }))
    })
  }

  handleBeforeUnload(e) {
    if (this.state.dirty) {
      const confirmationMessage = 'Changes you have made will not be saved.'
      e.returnValue = confirmationMessage
      return confirmationMessage
    }
  }

  handleRunScript() {
    let config, error

    try {
      config = YAML.parse(this.state.config)
    } catch (err) {
      error = err
    }

    this.setState({
      renderShell: false,
    }, () => {
      if (error) {
        this.setState({ error })
        return
      }

      this.setState({
        renderShell: true,
        activeConfig: config,
        activeHtml: this.state.html,
        activeCss: this.state.css,
        error
      })
    })
  }

  handleValidateScript() {
    const {
        config,
      } = this.state

    try {
      let configYml = YAML.parse(config)
      Toast.showToast({
        title: 'Valid Config',
        description: 'Your config is valid.',
        type: Toast.TYPE.NORMAL,
      })
    } catch (err) {
      console.error(err)
      Toast.showToast({
        title: 'Invalid Config',
        description: 'Your config is not valid YML.',
        type: Toast.TYPE.CRITICAL,
        sticky: true,
        actions: [{
          label: 'Details',
          onClick: () => this.handleOpenEditModal('console', 'Console'),
        }],
      })
    }
  }

  handleDownloadAssets() {
    const {
        config,
        html,
        css,
      } = this.state,
      zip = new JSZip()
    let name = 'my-nr1-app'

    try {
      let configYml = YAML.parse(config)
      if (configYml.name) {
        name = `${configYml.name}${configYml.version ? `-${configYml.version}` : ''}`
      }
    } catch (err) {
      console.error(err)
      Toast.showToast({
        title: 'Config Parse Error',
        description: 'Your current config is not valid YML. Please resolve this and try again.',
        type: Toast.TYPE.CRITICAL,
        actions: [{
          label: 'Details',
          onClick: () => this.handleOpenEditModal('console', 'Console'),
        }],
        sticky: true,
      })
      return
    }

    zip.folder(name)
      .file('config.yml', config)
      .file('index.html', html)
      .file('style.css', css)
      .generateAsync({type: 'blob'})
      .then(blob => {
        clickDownloadLink(
          URL.createObjectURL(blob),
          `${name}.zip`
        )
      })
  }

  handleOpenEditModal(key, title, mode) {
    this.setState({
      modalKey: key,
      modalTitle: title,
      modalMode: mode,
      [`${key}_edit`]: this.state[key],
    })
  }

  handleEditModalChange(modalKey, value) {
    this.setState({ [`${modalKey}_edit`]: value })
  }

  handleCloseEditModal(key) {
    if (key && key !== 'console') {
      this.setState({
        modalKey: null,
        [key]: this.state[`${key}_edit`],
        dirty: true,
      })
      return
    }
    this.setState({ modalKey: null })
  }

  handleConfigChange(value) {
    this.setState({ config: value, dirty: true })
  }

  handleHtmlChange(value) {
    this.setState({ html: value, dirty: true })
  }

  handleCssChange(value) {
    this.setState({ css: value, dirty: true })
  }

  handleSelectExample(example) {
    if (this.state.dirty) {
      if (!window.confirm('There are unsaved changes. Are you sure you want to discard?')) {
        return
      }
    }

    this.setState({
      config: example.config,
      html: example.views.home,
      css: example.css,
      dirty: false,
    })
  }

  render() {
    const {
      config,
      html,
      css,
      renderShell,
      error,
      activeConfig,
      activeHtml,
      activeCss,
      modalKey,
      modalTitle,
      modalMode,
      logs,
    } = this.state

    return (
      <>
        <Stack
          directionType={Stack.DIRECTION_TYPE.VERTICAL}
          horizontalType={Stack.HORIZONTAL_TYPE.FILL}
          fullWidth
          fullHeight
          className="nf-ide"
        >
          <StackItem grow className='content-container'>
            <NerdpackLayoutStandard
              sidebar={
                <SidebarView
                  config={config}
                  html={html}
                  css={css}
                  onConfigChange={this.handleConfigChange}
                  onHtmlChange={this.handleHtmlChange}
                  onCssChange={this.handleCssChange}
                  onOpenEditModal={this.handleOpenEditModal}
                />
              }
              sidebarClassName="nf-sidebar"
              content={
                <OutputView
                  renderShell={renderShell}
                  error={error}
                  config={activeConfig}
                  html={activeHtml}
                  css={activeCss}
                  onRunScript={this.handleRunScript}
                  onValidateScript={this.handleValidateScript}
                  onDownloadAssets={this.handleDownloadAssets}
                  onOpenEditModal={this.handleOpenEditModal}
                  onSelectExample={this.handleSelectExample}
                />
              }
              contentClassName="nf-content"
            />
          </StackItem>
        </Stack>
        <EditModalView
          editKey={modalKey}
          title={modalTitle}
          mode={modalMode}
          value={this.state[`${modalKey}_edit`]}
          logs={logs}
          onClose={this.handleCloseEditModal}
          onChange={this.handleEditModalChange}
        />
      </>
    )
  }
}
