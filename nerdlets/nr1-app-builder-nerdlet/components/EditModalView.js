import React from 'react';
import {
  Button,
  HeadingText,
} from 'nr1'
import AceEditor from 'react-ace'
import "ace-builds/src-noconflict/mode-yaml"
import "ace-builds/src-noconflict/mode-html"
import "ace-builds/src-noconflict/mode-css"
import "ace-builds/src-noconflict/theme-tomorrow_night"
import { Console } from 'console-feed'
import ReactModal from 'react-modal';

const EditModalView = props => {
  const {
    editKey,
    title,
    mode,
    value,
    logs,
    onClose,
    onChange,
  } = props

  return (
    <ReactModal
      closeTimeoutMS={200}
      isOpen={editKey !== null}
      contentLabel="modal"
      style={{
        overlay: {
          zIndex: 101,
          backgroundColor: "rgb(33,33,33,0.75)"
        },
        content : {
          top: '10%',
          left: '25%',
          right: '25%',
          bottom: '15%',
          marginRight: '-25%',
          transform: 'translate(-15%, 0%)'
        }
      }}
      onRequestClose={() => onClose(editKey)}
      ariaHideApp={false}
    >
      <HeadingText
        type={HeadingText.TYPE.HEADING_3}
        spacingType={[HeadingText.SPACING_TYPE.MEDIUM, HeadingText.SPACING_TYPE.NONE]}
      >
        {title}
      </HeadingText>
      <div className="content-pane full-width">
        <div className="content-container">
          <div className="inner-content-container">
          {
            editKey === 'console' ? (
              <div className="console">
                <Console
                  logs={logs}
                  variant="dark"
                />
              </div>
            ) : (
              editKey && <AceEditor
                mode={mode}
                theme="tomorrow_night"
                name="overlay-editor"
                width="100%"
                height="600px"
                onChange={newValue => onChange(editKey, newValue)}
                editorProps={{ $blockScrolling: true }}
                value={value}
              />
            )
          }
          </div>
          <div className="button-bar">
            <Button
              onClick={() => onClose(editKey)}
              type={Button.TYPE.NORMAL}
            >
              Cancel
            </Button>
            {
              editKey && editKey !== 'console' && (
                <Button
                  onClick={() => onClose(editKey)}
                  type={Button.TYPE.PRIMARY}
                >
                  Save
                </Button>
              )
            }
          </div>
        </div>
      </div>
    </ReactModal>
  )
}

export default EditModalView
