import React from 'react'
import PropTypes from 'prop-types'
import {
  Grid,
  GridItem,
  Stack,
  StackItem,
  Select,
  SelectItem,
  TextField,
  Button
} from 'nr1'

export function Toolbar(props) {
  const {
    children,
    showDropdown,
    showSearch,
    dropdownLabel,
    dropdownItems,
    searchLabel,
    searchPlaceholder,
    showPrimaryButton,
    primaryButtonIcon,
    primaryButtonLabel,
    onPrimaryClick,
    className,
  } = props

  return (
    <Stack
      className={`toolbar-container ${className || ''}`}
      fullWidth
      gapType={Stack.GAP_TYPE.NONE}
      horizontalType={Stack.HORIZONTAL_TYPE.FILL_EVENLY}
      verticalType={Stack.VERTICAL_TYPE.FILL}
    >
      <StackItem className="toolbar-section1">
        <Stack
          gapType={Stack.GAP_TYPE.NONE}
          fullWidth
          verticalType={Stack.VERTICAL_TYPE.FILL}
        >
          {
            showDropdown &&
            <ToolbarItem>
              <Select label={dropdownLabel || ''}>
                {
                  dropdownItems &&
                  Object.keys(dropdownItems).map(key => (
                    <SelectItem key={key} value={key}>{dropdownItems[key]}</SelectItem>
                  ))
                }
              </Select>
            </ToolbarItem>
          }
          {
            showSearch &&
            <ToolbarItem className="toolbar-item">
              <TextField label={searchLabel || ''} placeholder={searchPlaceholder || ''} />
            </ToolbarItem>
          }
          {children}
        </Stack>
      </StackItem>
      <StackItem className="toolbar-section2">
        <Stack
          fullWidth
          fullHeight
          verticalType={Stack.VERTICAL_TYPE.CENTER}
          horizontalType={Stack.HORIZONTAL_TYPE.RIGHT}
        >
          {
            showPrimaryButton &&
            <StackItem>
              <Button
                type={Button.TYPE.PRIMARY}
                iconType={primaryButtonIcon}
                onClick={onPrimaryClick}
              >
                {primaryButtonLabel || 'Button'}
              </Button>
            </StackItem>
          }
        </Stack>
      </StackItem>
    </Stack>
  )
}

Toolbar.propTypes = {
  children: PropTypes.arrayOf(PropTypes.element),
  showDropdown: PropTypes.bool,
  showSearch: PropTypes.bool,
  dropdownLabel: PropTypes.string,
  dropdownItems: PropTypes.object,
  searchLabel: PropTypes.string,
  searchPlaceholder: PropTypes.string,
  showPrimaryButton: PropTypes.bool,
  primaryButtonIcon: PropTypes.string,
  primaryButtonLabel: PropTypes.string,
  onPrimaryClick: PropTypes.func,
  className: PropTypes.string,
}

export function ToolbarItem(props) {
  const {
    children
  } = props
  return (
    <StackItem className="toolbar-item has-separator">
      {children}
    </StackItem>
  )
}

ToolbarItem.propTypes = {
  children: PropTypes.element,
}

function NerdpackLayoutStandard(props) {
  const {
    toolbar,
    sidebar,
    content,
    toolbarClassName,
    sidebarClassName,
    contentClassName,
  } = props

  return (
    <div className={"standard-layout " + (toolbar ? "toolbar " : "") + (toolbarClassName || '')}>
      {
        toolbar
      }
      <Grid
        className="primary-grid"
        spacingType={[Grid.SPACING_TYPE.NONE, Grid.SPACING_TYPE.NONE]}
      >
        {
          sidebar && (
            <GridItem className={`sidebar-container ${sidebarClassName || ''}`} columnSpan={3}>
              {sidebar}
            </GridItem>
          )
        }
        <GridItem className={`primary-content-container ${contentClassName || ''}`} columnSpan={sidebar ? 9 : 12}>
          <main className="primary-content full-height">
            {content}
          </main>
        </GridItem>
      </Grid>
    </div>
  )
}

NerdpackLayoutStandard.propTypes = {
  toolbar: PropTypes.element,
  sidebar: PropTypes.element,
  content: PropTypes.element,
  toolbarClassName: PropTypes.string,
  sidebarlassName: PropTypes.string,
  contentClassName: PropTypes.string,
}

export default NerdpackLayoutStandard
