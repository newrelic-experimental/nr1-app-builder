import React from 'react';
import {
  Stack,
  StackItem,
} from 'nr1'
import HtmlEditorView from './HtmlEditorView'
import SourceEditorView from './SourceEditorView'

const SidebarView = props => {
  const {
    config,
    views,
    css,
    selectedView,
    selectedHtml,
    onOpenEditModal,
    onAddView,
    onRemoveView,
    onConfigChange,
    onViewSelected,
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
        <HtmlEditorView
          views={views}
          selectedView={selectedView}
          selectedHtml={selectedHtml}
          onOpenEditModal={onOpenEditModal}
          onViewSelected={onViewSelected}
          onChange={onHtmlChange}
          onAddView={onAddView}
          onRemoveView={onRemoveView}
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
