import React from 'react';
import {
  Stack,
  StackItem,
  HeadingText,
  Link,
  Icon,
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
          <Link
            onClick={() => onOpenEditModal(editKey, `Edit ${title}`, mode)}
          >
            Edit
            <Icon type={Icon.TYPE.INTERFACE__OPERATIONS__EXTERNAL_LINK} />
          </Link>
        </HeadingText>
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
