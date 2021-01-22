import React from 'react';
import {
  Stack,
  StackItem,
} from 'nr1'
import SourceEditorView from './SourceEditorView'

const SidebarView = props => {
  const {
    config,
    html,
    css,
    onOpenEditModal,
    onConfigChange,
    onHtmlChange,
    onCssChange,
  } = props

  return (
    <Stack
      directionType={Stack.DIRECTION_TYPE.VERTICAL}
      verticalType={Stack.VERTICAL_TYPE.TOP}
      gapType={Stack.GAP_TYPE.LARGE}
      fullWidth
      fullHeight
    >
      <StackItem className="source-pane full-width">
        <SourceEditorView
          title="Config"
          editKey="config"
          mode="yaml"
          value={config}
          onOpenEditModal={onOpenEditModal}
          onChange={onConfigChange}
        />
      </StackItem>
      <StackItem className="source-pane full-width">
        <SourceEditorView
          title="HTML"
          editKey="html"
          mode="html"
          value={html}
          onOpenEditModal={onOpenEditModal}
          onChange={onHtmlChange}
        />
      </StackItem>
      <StackItem className="source-pane full-width">
        <SourceEditorView
          title="CSS"
          editKey="css"
          mode="css"
          value={css}
          onOpenEditModal={onOpenEditModal}
          onChange={onCssChange}
        />
      </StackItem>
    </Stack>
  )
}

export default SidebarView
