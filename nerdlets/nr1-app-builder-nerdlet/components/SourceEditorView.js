import React from 'react';
import {
  Stack,
  StackItem,
  HeadingText,
  Button,
  Tooltip,
} from 'nr1'
import AceEditor from 'react-ace'
import "ace-builds/src-noconflict/mode-yaml"
import "ace-builds/src-noconflict/mode-handlebars"
import "ace-builds/src-noconflict/mode-css"
import "ace-builds/src-noconflict/theme-tomorrow_night"

const SourceEditorView = props => {
  const {
    title,
    editKey,
    mode,
    value,
    onOpenEditModal,
    onChange,
  } = props

  return (
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
          {title}
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
              onClick={() => onOpenEditModal(editKey, `Edit ${title}`, mode)}
            />
          </Tooltip>
          {
            editKey === 'config' && (
              <Tooltip
                text="App Builder uses JSONPath expressions to select and manipulate data."
                placementType={Tooltip.PLACEMENT_TYPE.BOTTOM}
                additionalInfoLink={{
                  label: "JSONPath Reference",
                  to: "https://goessner.net/articles/JsonPath/",
                }}
              >
                <Button
                  type={Button.TYPE.OUTLINE}
                  sizeType={Button.SIZE_TYPE.SMALL}
                  iconType={Button.ICON_TYPE.INTERFACE__INFO__HELP}
                  onClick={() => window.open("https://goessner.net/articles/JsonPath/")}
                />
              </Tooltip>
            )
          }
          {
            editKey === 'css' && (
              <Tooltip
                text="App Builder uses CSS to style views."
                placementType={Tooltip.PLACEMENT_TYPE.BOTTOM}
                additionalInfoLink={{
                  label: "CSS Reference",
                  to: "https://developer.mozilla.org/en-US/docs/Web/CSS",
                }}
              >
                <Button
                  type={Button.TYPE.OUTLINE}
                  sizeType={Button.SIZE_TYPE.SMALL}
                  iconType={Button.ICON_TYPE.INTERFACE__INFO__HELP}
                  onClick={() => window.open("https://developer.mozilla.org/en-US/docs/Web/CSS")}
                />
              </Tooltip>
            )
          }
        </div>
      </StackItem>
      <StackItem className="source-pane-editor" grow>
        <AceEditor
          mode={mode}
          theme="tomorrow_night"
          name={`${editKey}-editor`}
          width="100%"
          onChange={value => onChange(value)}
          editorProps={{ $blockScrolling: true }}
          value={value}
          height="100%"
          tabSize={2}
          setOptions={{ useSoftTabs: true }}
        />
      </StackItem>
    </Stack>
  )
}

export default SourceEditorView
