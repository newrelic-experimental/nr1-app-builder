import React, { Component } from 'react'
import Handlebars from 'handlebars'
import Jhh from 'just-handlebars-helpers'
import ErrorView from './ErrorView'

Handlebars.registerHelper("for", function(items, options) {
  const params = options.hash,
    start = params.start || 0,
    end = start + params.count || items.length
  let data

  if (options.data) {
    data = Handlebars.createFrame(options.data);
  }

  return items
    .slice(start, end)
    .reduce((accum, curr, index) => {
      data.index = index
      return accum + options.fn(curr, { data })
    }, '')
})

Jhh.registerHelpers(Handlebars)

const OutputView = props => {
  const {
    context,
    html,
    css,
  } = props
  let styles = `<style>${css}</style>`

  const template = Handlebars.compile(
      `${styles}${html}`
    ),
    compiledHtml = template(context || {})

  return (
    <div
      className="full-width full-height"
      dangerouslySetInnerHTML={{__html: compiledHtml}}>
    </div>
  )
}

class UnmanagedOutputView extends Component {
  componentDidMount() {
    const element = document.getElementById(`${this.props.config.name}-submit`)

    if (element) {
      element.addEventListener('click', this.props.onRun)
    }
  }

  render() {
    const {
      html,
      css,
      context
    } = this.props

    return (
      <OutputView
        html={html}
        css={css}
        context={context}
      />
    )
  }
}

export default class OutputWrapper extends Component {
  componentDidMount() {
    const {
      config,
      context,
    } = this.props

    if (!context) {
      return
    }

    if (context.components) {
      context.components.forEach(cmpnt => {
        const element = document.getElementById(cmpnt.name)

        if (!element) {
          console.warn(`Missing element for component ${cmpnt.name}`)
          return
        }

        if (React.isValidElement(cmpnt.content)) {
          ReactDOM.render(
            cmpnt.content,
            element
          )
          return
        }

        if (typeof cmpnt.content === 'string') {
          element.innerHTML = cmpnt.content
          return
        }
      })
    }
  }

  render() {
    const {
      views,
      css,
      config,
      context,
      route,
      managed,
      onRun,
    } = this.props,
    html = views[route]

    if (!html) {
      return (
        <ErrorView
          heading={config.config && config.config['error-heading']}
          description={config.config && config.config['error-description']}
          error={new Error(`Missing view for route ${route}`)}
        />
      )
    }

    return (
      managed ? (
        <OutputView
          html={html}
          css={css}
          config={config}
          context={context}
        />
      ) : (
        <UnmanagedOutputView
          html={html}
          css={css}
          config={config}
          context={context}
          onRun={onRun}
        />
      )
    )
  }
}
