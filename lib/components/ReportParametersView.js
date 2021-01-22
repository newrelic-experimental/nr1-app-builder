import React, { Component } from 'react'
import PropTypes from 'prop-types'
import {
  Stack,
  StackItem,
  Button,
  Spacing,
  TextField,
  AccountPicker,
  Select,
  SelectItem,
} from 'nr1'
import DatePicker from 'react-datepicker'
import { Toolbar, ToolbarItem } from './NerdpackLayoutStandard'

const ReportParamView = props => {
  const {
    param,
    name,
    value,
    onChange,
  } = props
  let Component

  switch (param.type) {
    case 'account':
      Component = (
        <Spacing key={name} type={[TextField.SPACING_TYPE.SMALL, TextField.SPACING_TYPE.OMIT]}>
          <div>
            <label className={'label ' + (param.required ? 'required': '')}>{param.label}</label>
            <AccountPicker
              value={value}
              onChange={newValue => onChange(newValue, name)}
            />
          </div>
        </Spacing>
      )
      break;

    case 'select':
      Component = (
        <Spacing key={name} type={[TextField.SPACING_TYPE.SMALL, TextField.SPACING_TYPE.OMIT]}>
          <div>
            <Select
              label={param.label}
              onChange={(e, value) => (
                onChange((typeof value === 'object' ? value.value : value), name)
              )}
              value={value}
              className={param.required ? 'required': ''}
            >
            {
              param.options.map((opt, index) => (
                <SelectItem key={`${param.name}-index`} value={opt.value || opt}>{opt.label || opt}</SelectItem>
              ))
            }
            </Select>
          </div>
        </Spacing>
      )
      break;

    case 'datetime':
      Component = (
        <Spacing key={name} type={[TextField.SPACING_TYPE.SMALL, TextField.SPACING_TYPE.OMIT]}>
          <div>
            <label className={'label ' + (param.required ? 'required': '')}>{param.label}</label>
            <DatePicker
              selected={value}
              onChange={date => onChange(date, name)}
              timeFormat="HH:mm"
              timeIntervals={15}
              timeCaption="time"
              dateFormat="yyyy-MM-dd HH:mm"
              placeholderText="Click to select a date"
              showTimeInput
              shouldCloseOnSelect={false}
            />
          </div>
        </Spacing>
      )
      break;

    default:
      Component = (
        <TextField
          label={param.label}
          placeholder={`Enter the ${param.label}`}
          spacingType={[TextField.SPACING_TYPE.SMALL, TextField.SPACING_TYPE.OMIT]}
          value={value || ''}
          onChange={e => onChange(e.target.value, name)}
          className={param.required ? 'required': ''}
        />
      )
      break;
  }

  return Component
}

const ReportParametersSidebarView = props =>  {
  const {
    params,
    values,
    onChange,
    onRun,
  } = props

  return (
    <Stack
      directionType={Stack.DIRECTION_TYPE.VERTICAL}
      fullHeight
      fullWidth
      className='report-params-view sidebar'
    >
      <StackItem
        className='report-params'
      >
        <Stack
          directionType={Stack.DIRECTION_TYPE.VERTICAL}
          fullWidth
        >
          <StackItem>
            <h2>Parameters</h2>
          </StackItem>
          {
            Object.keys(params).map(key => {
              return (
                <StackItem
                  key={key}
                  grow
                  shrink
                >
                  <ReportParamView
                    param={params[key]}
                    name={key}
                    value={values[key]}
                    onChange={onChange}
                  />
                </StackItem>
              )
            })
          }
        </Stack>
      </StackItem>
      <StackItem
        className='button-bar'
        id='button-bar'
      >
        <Button
          type={Button.TYPE.PRIMARY}
          onClick={() => onRun(values)}
        >
          Apply
        </Button>
      </StackItem>
    </Stack>
  )
}

const ReportParametersToolbarView = props =>  {
  const {
    params,
    values,
    onChange,
    onRun,
  } = props

  return (
    <Toolbar
      showPrimaryButton={true}
      primaryButtonLabel='Apply'
      onPrimaryClick={() => onRun(values)}
      className='report-params-view toolbar'
    >
      {
        Object.keys(params).map(key => {
          return (
            <ToolbarItem key={key}>
              <ReportParamView
                param={params[key]}
                name={key}
                value={values[key]}
                onChange={onChange}
              />
            </ToolbarItem>
          )
        })
      }
    </Toolbar>
  )
}

export default class ReportParametersView extends Component {
  constructor(props) {
    super(props)
    this.state = {}

    Object.keys(this.props.params).forEach(key => {
      const param = this.props.params[key]

      this.state[key] = null
      if (param.default !== undefined) {
        this.state[key] = param.default
      }
    })

    this.handleInputChange = this.handleInputChange.bind(this)
  }

  handleInputChange(value, key) {
    this.setState({ [key]: value })
  }

  render() {
    const {
      params,
      toolbar,
      onRun,
    } = this.props

    return (
      toolbar ? (
        <ReportParametersToolbarView
          params={params}
          values={this.state}
          onChange={this.handleInputChange}
          onRun={onRun}
        />
      ) : (
        <ReportParametersSidebarView
          params={params}
          values={this.state}
          onChange={this.handleInputChange}
          onRun={onRun}
        />
      )
    )
  }
}

ReportParametersView.propTypes = {
  params: PropTypes.object.isRequired,
  onRun: PropTypes.func.isRequired,
}
