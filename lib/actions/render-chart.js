import {
  AreaChart,
  BarChart,
  BillboardChart,
  FunnelChart,
  HeatmapChart,
  HistogramChart,
  JsonChart,
  LineChart,
  PieChart,
  ScatterChart,
  SparklineChart,
  StackedBarChart,
  TableChart,
} from 'nr1'
import date from 'date-and-time'
import {
  $,
  storeComponent,
  modifyQuery,
  parseAccountIds,
} from '../util'

const typeToChart = {
  Area: AreaChart,
  Bar: BarChart,
  Billboard: BillboardChart,
  Funnel: FunnelChart,
  Heatmap: HeatmapChart,
  Histogram: HistogramChart,
  Json: JsonChart,
  Line: LineChart,
  Pie: PieChart,
  Scatter: ScatterChart,
  Sparkline: SparklineChart,
  StackedBar: StackedBarChart,
  Table: TableChart,
}

const combineData = (dimensions, values) => {
  const datum = []
  let max = 0

  values.forEach(val => {
    if (val.length > max) {
      max = val.length
    }
  })

  for (let index = 0; index < max; index += 1) {
    const obj = {}

    dimensions.forEach((dim, index2) => {
      obj[dim] = index2 < values.length ? (
        index < values[index2].length ? values[index2][index] :  null
      ) : null
    })

    datum.push(obj)
  }

  return datum
}

const getValues = (context, seriesData, name) => {
  const dim = seriesData[name]

  if (!dim) {
    return []
  }

  if (typeof dim === 'string') {
    const values = $(context, dim)
    if (!values) {
      return []
    }

    return values.map(val => (
      typeof val !== 'number' ? new Number(val) : val
    ))
  } else if (
    typeof dim === 'object' &&
    dim.values
  ) {
    const values = $(context, dim.values)
    if (!values) {
      return []
    }

    return values.map(val => {
      if (typeof val === 'number') {
        return val
      }

      if (dim.type) {
        const type = dim.type

        if (type === 'date' && dim.format) {
          const dateVal = date.parse(val, dim.format)
          return isNaN(dateVal) ? null : dateVal.getTime()
        }
      }

      return new Number(val)
    })
  }

  return []
}

const makeSeriesFromType = (action, context, seriesData, index) => {
  const series = {
      data: [],
      metadata: {
        viz: seriesData.style || 'main',
        color: seriesData.color || 'blue',
      },
    }

  series.metadata.id = seriesData.id || `series-${index}`
  series.metadata.name = seriesData.name || `Series ${index}`

  if (seriesData.type === '2D') {
    const x = getValues(context, seriesData, 'x'),
      y = getValues(context, seriesData, 'y')

    series.metadata.units_data = {
      x: 'UNKNOWN',
      y: 'UNKNOWN',
    }

    if (seriesData.x && seriesData.x.units) {
      series.metadata.units_data.x = seriesData.x.units
    }
    if (seriesData.y && seriesData.y.units) {
      series.metadata.units_data.y = seriesData.y.units
    }

    series.data = combineData(['x', 'y'], [x, y])
  } else if (seriesData.type === '1D') {
    const y = getValues(context, seriesData, 'y')

    series.metadata.units_data = {
      y: 'UNKNOWN',
    }

    if (seriesData.y && seriesData.y.units) {
      series.metadata.units_data.y = seriesData.y.units
    }

    series.data = combineData(['y'], [y])
  } else if (seriesData.type === 'table' || action.type === 'Table') {
    const values = $(context, seriesData.values)
    if (values && values.length > 0) {
      series.data = values
      if (!seriesData.columns) {
        const columns = [],
          item = values[0]

        Object.keys(item).forEach(key => columns.push(key))
        series.metadata.columns = columns
      } else {
        series.metadata.columns = seriesData.columns
      }
    }
  }

  return series
}

const makeSeries = (action, context, seriesData, index) => {
  if (!seriesData.data) {
    return makeSeriesFromType(action, context, seriesData, index)
  }

  const series = {
    data: [],
    metadata: {
      id: `series-${index}`,
      name: `Series ${index}`,
    },
  }

  if (typeof seriesData.data === 'string') {
    series.data = $(context, seriesData.data)
  } else if (typeof seriesData.data === 'object') {
    series.data = seriesData.data
  }

  if (typeof seriesData.metadata === 'string') {
    series.metadata = $(context, seriesData.metadata)
  } else if (typeof seriesData.metadata === 'object') {
    series.metadata = seriesData.metadata
  }

  return series
}

/*
 * action: render-chart:
 * at: string || null (default: context.task_name)
 * type: string (required)
 * query: string
 * account_id: string
 * series: jp | array of object | object (default: _)
 *
 * Either query and account_id need to be specified or series (which defaults
 * to _)
 */

const renderChart = (action, context) => {
  const series = action.series,
    Chart = typeToChart[action.type]
  let data = null

  if (!Chart) {
    throw new Error(`Chart type ${action.type} is not valid`)
  }

  if (action.query && action.account_id) {
    const accountIds = parseAccountIds(action, context, action.account_id)

    if (accountIds && accountIds.length > 0) {
      storeComponent(
        action,
        context,
        <Chart
          query={modifyQuery(action, context, action.query)}
          accountId={accountIds[0]}
          fullWidth
          fullHeight
        />
      )
    }
  } else if (!series) {
    // Assume that _ is the combined result of a run-nrql OR a single
    // result of a run-nrql.
    if (Array.isArray(context._)) {
      data = context._.reduce((accum, currValue) => {
        const chart = currValue.chart

        if (!chart) {
          return accum
        }

        if (Array.isArray(chart)) {
          chart.forEach(value => {
            if (value.data && value.metadata) {
              accum.push(value)
            }
          })
        } else if (chart.data && chart.metadata) {
          accum.push(chart)
        }

        return accum
      }, [])
    } else {
      const chart = context._.chart

      if (Array.isArray(chart)) {
        data = chart
      } else if (chart.data && chart.metadata) {
        data = chart
      }
    }
  } else if (typeof series === 'string') {
    data = $(context, series)
  } else if (Array.isArray(series)) {
    data = series.map((item, index) => (
      makeSeries(action, context, item, index)
    ))
  } else if (typeof series === 'object') {
    data = [ makeSeries(action, context, series, 1) ]
  }

  if (data) {
    storeComponent(
      action,
      context,
      <Chart data={data} fullWidth fullHeight />
    )
  }

  return Promise.resolve(context)
}

export default renderChart
