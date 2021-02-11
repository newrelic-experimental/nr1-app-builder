import React from 'react';
import {
  Button,
  Stack,
  StackItem,
  Dropdown,
  DropdownItem
} from 'nr1'
import EmptyView from '../../../lib/components/EmptyView'
import ErrorView from '../../../lib/components/ErrorView'
import ShellView from '../../../lib/components/ShellView'
import examples from '../../../examples'

const OutputView = props => {
  const {
    renderShell,
    error,
    config,
    views,
    css,
    onRunScript,
    onValidateScript,
    onDownloadAssets,
    onOpenEditModal,
    onSelectExample,
    onOpenStackedRoute,
  } = props

  return (
    <Stack
      directionType={Stack.DIRECTION_TYPE.VERTICAL}
      verticalType={Stack.VERTICAL_TYPE.TOP}
      gapType={Stack.GAP_TYPE.LARGE}
      fullWidth
      fullHeight
    >
      <StackItem className="nf-toolbar">
        <Stack
          directionType={Stack.DIRECTION_TYPE.HORIZONTAL}
          verticalType={Stack.VERTICAL_TYPE.CENTER}
          gapType={Stack.GAP_TYPE.LARGE}
          fullWidth
          fullHeight
        >
          <StackItem>
            <Button
              onClick={onRunScript}
              type={Button.TYPE.PRIMARY}
              iconType={Button.ICON_TYPE.INTERFACE__CARET__CARET_RIGHT__V_ALTERNATE}
            >
              Run
            </Button>
          </StackItem>
          <StackItem>
            <Button
              onClick={onValidateScript}
              type={Button.TYPE.NORMAL}
              iconType={Button.ICON_TYPE.INTERFACE__SIGN__CHECKMARK__V_ALTERNATE}
            >
              Validate
            </Button>
          </StackItem>
          <StackItem className="console-button">
            <Button
              onClick={() => onOpenEditModal('console', 'Console')}
              type={Button.TYPE.NORMAL}
              sizeType={Button.SIZE_TYPE.SMALL}
            >
              Console
            </Button>
          </StackItem>
          <StackItem className="download-button">
            <Button
              onClick={onDownloadAssets}
              type={Button.TYPE.NORMAL}
              sizeType={Button.SIZE_TYPE.SMALL}
            >
              Download
            </Button>
          </StackItem>
          <StackItem className="toolbar-label">
            Examples:
          </StackItem>
          <StackItem>
            <Dropdown title="Select...">
              {
                examples.map((example, index) => (
                  <DropdownItem
                    key={`example-${index}`}
                    onClick={() => onSelectExample(example)}
                  >
                    {example.label}
                  </DropdownItem>
                ))
              }
            </Dropdown>
          </StackItem>
        </Stack>
      </StackItem>
      <StackItem className="output-pane">
        {
          renderShell ? (
            <ShellView
              config={config}
              views={views}
              css={css}
              onOpenStackedRoute={onOpenStackedRoute}
            />
          ) : (
            error ? (
              <ErrorView
                error={error}
              />
            ) : (
              <EmptyView
                heading="Nothing to see here"
                description='Click "Run" to test your app'
              />
            )
          )
        }
      </StackItem>
    </Stack>
  )
}

export default OutputView
