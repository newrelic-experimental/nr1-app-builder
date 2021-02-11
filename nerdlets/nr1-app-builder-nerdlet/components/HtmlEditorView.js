import React, { Component } from 'react';
import {
  Stack,
  StackItem,
  HeadingText,
  Button,
  Icon,
  Tabs,
  TabsItem,
  Tooltip,
  BlockText,
  TextField,
  Modal,
} from 'nr1'
import AceEditor from 'react-ace'
import "ace-builds/src-noconflict/mode-yaml"
import "ace-builds/src-noconflict/mode-handlebars"
import "ace-builds/src-noconflict/mode-css"
import "ace-builds/src-noconflict/theme-tomorrow_night"

class HtmlEditorView extends Component {
  constructor(props) {
    super(props)
    this.state = {
      viewId: '',
      hideModal: true,
    }
    this.handleViewIdChange = this.handleViewIdChange.bind(this)
    this.handleClose = this.handleClose.bind(this)
  }

  handleViewIdChange(event) {
    this.setState({ viewId: event.target.value })
  }

  handleClose(viewId) {
    const {
      onAddView
    } = this.props

    this.setState(
      { hideModal: true },
      () => {
        if (viewId) {
          onAddView(viewId)
        }
      }
    )
  }

  render() {
    const {
      views,
      selectedView,
      selectedHtml,
      onOpenEditModal,
      onViewSelected,
      onChange,
      onRemoveView,
    } = this.props

    return (
      <>
        <Stack
          directionType={Stack.DIRECTION_TYPE.VERTICAL}
          verticalType={Stack.VERTICAL_TYPE.TOP}
          gapType={Stack.GAP_TYPE.LARGE}
          className="source-pane-inner"
          fullWidth
          fullHeight
        >
          <StackItem className="source-pane-header">
            <HeadingText
              type={HeadingText.TYPE.HEADING_4}
              spacingType={[HeadingText.SPACING_TYPE.MEDIUM, HeadingText.SPACING_TYPE.NONE]}
              className="editHeader"
            >
              HTML
            </HeadingText>
            <div className="source-tools">
              <Tooltip
                text="Open the source editor dialog"
                placementType={Tooltip.PLACEMENT_TYPE.BOTTOM}
              >
                <Button
                  type={Button.TYPE.OUTLINE}
                  sizeType={Button.SIZE_TYPE.SMALL}
                  iconType={Button.ICON_TYPE.INTERFACE__OPERATIONS__EDIT}
                  onClick={() => onOpenEditModal('html', `Edit ${selectedView.id}`, 'handlebars')}
                />
              </Tooltip>
              <Tooltip
                text="Add a new view"
                placementType={Tooltip.PLACEMENT_TYPE.BOTTOM}
              >
                <Button
                  type={Button.TYPE.OUTLINE}
                  sizeType={Button.SIZE_TYPE.SMALL}
                  iconType={Button.ICON_TYPE.DOCUMENTS__DOCUMENTS__FILE__A_ADD}
                  onClick={() => this.setState({ hideModal: false })}
                />
              </Tooltip>
              <Tooltip
                text="Remove this view"
                placementType={Tooltip.PLACEMENT_TYPE.BOTTOM}
              >
                <Button
                  type={Button.TYPE.OUTLINE}
                  sizeType={Button.SIZE_TYPE.SMALL}
                  iconType={Button.ICON_TYPE.DOCUMENTS__DOCUMENTS__FILE__A_REMOVE}
                  onClick={() => onRemoveView(selectedView.id)}
                  disabled={views.length === 1}
                />
              </Tooltip>
              <Tooltip
                text="App Builder views are specified as Handlebars templates."
                placementType={Tooltip.PLACEMENT_TYPE.BOTTOM}
                additionalInfoLink={{
                  label: "Handlebars Language Guide",
                  to: "https://handlebarsjs.com/guide/",
                }}
              >
                <Button
                  type={Button.TYPE.OUTLINE}
                  sizeType={Button.SIZE_TYPE.SMALL}
                  iconType={Button.ICON_TYPE.INTERFACE__INFO__HELP}
                  onClick={() => window.open("https://handlebarsjs.com/guide/")}
                />
              </Tooltip>
            </div>
          </StackItem>
          <StackItem className="source-pane-editor" grow>
            <Tabs defaultValue="tab-0" value={selectedView} className="html-tabs" onChange={onViewSelected}>
              {
                views.map((view, index) => {
                  return (
                    <TabsItem key={`tab-${index}`} value={index} label={view.id}>
                      {
                        index == selectedView ? (
                          <AceEditor
                            mode="handlebars"
                            theme="tomorrow_night"
                            name={`html-editor`}
                            width="100%"
                            onChange={onChange}
                            editorProps={{ $blockScrolling: true }}
                            value={selectedHtml}
                            height="100%"
                            tabSize={2}
                            setOptions={{ useSoftTabs: true }}
                          />
                        ) : (
                          <div></div>
                        )
                      }
                    </TabsItem>
                  )
                })
              }
            </Tabs>
          </StackItem>
        </Stack>
        <Modal hidden={this.state.hideModal} onClose={this.handleClose}>
          <Stack
            directionType={Stack.DIRECTION_TYPE.VERTICAL}
            verticalType={Stack.VERTICAL_TYPE.TOP}
            gapType={Stack.GAP_TYPE.SMALL}
            className="add-view-modal"
          >
            <StackItem>
              <BlockText>Enter an id for the new view:</BlockText>
            </StackItem>
            <StackItem>
              <TextField
                label="View ID"
                placeholder="e.g. home"
                onChange={this.handleViewIdChange}
              />
            </StackItem>
            <StackItem className="add-view-buttons">
              <Button
                type={Button.TYPE.NORMAL}
                sizeType={Button.SIZE_TYPE.SMALL}
                onClick={() => this.handleClose()}
              >
                Cancel
              </Button>
              <Button
                type={Button.TYPE.PRIMARY}
                sizeType={Button.SIZE_TYPE.SMALL}
                disabled={this.state.viewId.length === 0 || this.state.viewId.trim().length === ''}
                onClick={() => this.handleClose(this.state.viewId)}
              >
                Add
              </Button>
            </StackItem>
          </Stack>
        </Modal>
      </>
    )
  }
}

export default HtmlEditorView
