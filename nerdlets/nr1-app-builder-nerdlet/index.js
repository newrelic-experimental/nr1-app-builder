import React from 'react';
import {
  Stack,
  StackItem,
  Toast,
  UserStorageMutation,
  navigation,
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
      views: examples[0].views.slice(0),
      css: examples[0].css,
      selectedView: 0,
      selectedHtml: examples[0].views[0].content,
      logs: [],
      renderShell: false,
      activeConfig: null,
      activeViews: null,
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
    this.handleSaveEditModal = this.handleSaveEditModal.bind(this)
    this.handleConfigChange = this.handleConfigChange.bind(this)
    this.handleViewSelected = this.handleViewSelected.bind(this)
    this.handleHtmlChange = this.handleHtmlChange.bind(this)
    this.handleCssChange = this.handleCssChange.bind(this)
    this.handleSelectExample = this.handleSelectExample.bind(this)
    this.handleBeforeUnload = this.handleBeforeUnload.bind(this)
    this.handleOpenStackedRoute = this.handleOpenStackedRoute.bind(this)
    this.handleAddView = this.handleAddView.bind(this)
    this.handleRemoveView = this.handleRemoveView.bind(this)
  }

  componentDidMount() {
    window.addEventListener("beforeunload", this.handleBeforeUnload)
    /*Hook(window.console, log => {
      this.setState(({ logs }) => ({ logs: [...logs, Decode(log)] }))
    })*/
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

      const { selectedView, views, selectedHtml } = this.state

      views[selectedView].content = selectedHtml

      this.setState({
        renderShell: true,
        views: views,
        activeConfig: config,
        activeViews: this.state.views.map(view => {
          return Object.assign({}, view)
        }),
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
      YAML.parse(config)
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
        views,
        selectedView,
        selectedHtml,
        css,
      } = this.state,
      zip = new JSZip()
    let name = 'my-nr1-app'

    views[selectedView].content = selectedHtml

    this.setState({ views })

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

    const zippy = zip.folder(name).file('config.yml', config)

    views.forEach(view => zippy.file(`${view.id}.html`, view.content))

    zippy.file('style.css', css)
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
      [`${key}_edit`]: key === 'html' ? this.state.selectedHtml : this.state[key],
    })
  }

  handleEditModalChange(modalKey, value) {
    this.setState({ [`${modalKey}_edit`]: value })
  }

  handleCloseEditModal(key) {
    this.setState({ modalKey: null })
  }

  handleSaveEditModal(key) {
    const newState = {
      modalKey: null,
      dirty: true,
    }

    if (key === 'html') {
      newState.selectedHtml = this.state[`${key}_edit`]
    } else {
      newState[key] = this.state[`${key}_edit`]
    }

    this.setState(newState)
  }

  handleConfigChange(value) {
    this.setState({ config: value, dirty: true })
  }

  handleViewSelected(index) {
    const { selectedView, views, selectedHtml } = this.state,
      html = views[index].content

    views[selectedView].content = selectedHtml

    this.setState({ views, selectedView: index, selectedHtml: html })
  }

  handleHtmlChange(value) {
    this.setState({ selectedHtml: value, dirty: true })
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
      views: example.views.slice(0),
      css: example.css,
      dirty: false,
      selectedView: 0,
      selectedHtml: example.views[0].content,
    })
  }

  handleOpenStackedRoute(params) {
    const {
      activeConfig,
      activeViews,
      activeCss,
    } = this.state

    UserStorageMutation.mutate({
      actionType: UserStorageMutation.ACTION_TYPE.WRITE_DOCUMENT,
      collection: 'app-builder-tmp',
      documentId: 'app-src',
      document: {
        config: YAML.stringify(activeConfig),
        views: JSON.stringify(activeViews),
        css: activeCss,
      },
    })
    .then(() => {
      navigation.openStackedNerdlet({
        id: 'drawer',
        urlState: params,
      })
    })
  }

  handleAddView(viewId) {
    let {
        views,
        selectedView,
        selectedHtml,
      } = this.state,
      view = {
        id: viewId,
        content: '<h2>Hello, data nerd!</h2>'
      }

    views[selectedView].content = selectedHtml
    views.push(view)

    selectedView = views.length - 1
    selectedHtml = view.content

    this.setState({ views, selectedView, selectedHtml, dirty: true })
  }

  handleRemoveView(viewId) {
    if (confirm(`Are you sure you want to remove view ${viewId}? This action can not be undone.`)) {
      let {
          views,
          selectedView,
          selectedHtml,
        } = this.state,
        newSelectedView = selectedView

      if (selectedView + 1 === views.length) {
        newSelectedView = selectedView - 1
      }

      views.splice(selectedView, 1)

      selectedHtml = views[newSelectedView].content

      this.setState({ views, selectedView: newSelectedView, selectedHtml, dirty: true })
    }
  }

  render() {
    const {
      config,
      views,
      css,
      selectedView,
      selectedHtml,
      renderShell,
      error,
      activeConfig,
      activeViews,
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
                  views={views}
                  css={css}
                  selectedView={selectedView}
                  selectedHtml={selectedHtml}
                  onConfigChange={this.handleConfigChange}
                  onHtmlChange={this.handleHtmlChange}
                  onViewSelected={this.handleViewSelected}
                  onCssChange={this.handleCssChange}
                  onOpenEditModal={this.handleOpenEditModal}
                  onAddView={this.handleAddView}
                  onRemoveView={this.handleRemoveView}
                />
              }
              sidebarClassName="nf-sidebar"
              content={
                <OutputView
                  renderShell={renderShell}
                  error={error}
                  config={activeConfig}
                  views={activeViews}
                  css={activeCss}
                  onRunScript={this.handleRunScript}
                  onValidateScript={this.handleValidateScript}
                  onDownloadAssets={this.handleDownloadAssets}
                  onOpenEditModal={this.handleOpenEditModal}
                  onSelectExample={this.handleSelectExample}
                  onOpenStackedRoute={this.handleOpenStackedRoute}
                />
              }
              contentClassName="nf-content"
            />
          </StackItem>
        </Stack>
        {
          modalKey &&
          <EditModalView
            editKey={modalKey}
            title={modalTitle}
            mode={modalMode}
            value={this.state[`${modalKey}_edit`]}
            logs={logs}
            onClose={this.handleCloseEditModal}
            onSave={this.handleSaveEditModal}
            onChange={this.handleEditModalChange}
          />
        }
      </>
    )
  }
}
