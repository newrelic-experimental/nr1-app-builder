import helloWorld from '!raw-loader!./hello-world/config.yml'
import helloWorldHtml from '!raw-loader!./hello-world/index.html'
import helloWorldCss from '!raw-loader!./hello-world/style.css'
import helloToYou from '!raw-loader!./hello-to-you/config.yml'
import helloToYouHtml from '!raw-loader!./hello-to-you/index.html'
import helloToYouCss from '!raw-loader!./hello-to-you/style.css'
import helloToYouUnmanaged from '!raw-loader!./hello-to-you-custom-form/config.yml'
import helloToYouUnmanagedHtml from '!raw-loader!./hello-to-you-custom-form/index.html'
import helloToYouUnmanagedCss from '!raw-loader!./hello-to-you-custom-form/style.css'
import pageViewsByRegion from '!raw-loader!./pageviews-by-region/config.yml'
import pageViewsByRegionHtml from '!raw-loader!./pageviews-by-region/index.html'
import pageViewsByRegionCss from '!raw-loader!./pageviews-by-region/style.css'
import useNerdgraph from '!raw-loader!./use-nerdgraph/config.yml'
import useNerdgraphHtml from '!raw-loader!./use-nerdgraph/index.html'
import useNerdgraphCss from '!raw-loader!./use-nerdgraph/style.css'
import statusPages from '!raw-loader!./status-pages/config.yml'
import statusPagesHtml from '!raw-loader!./status-pages/index.html'
import statusPagesCss from '!raw-loader!./status-pages/style.css'

export default [
  {
    label: 'Hello World',
    config: helloWorld,
    views: {
      home: helloWorldHtml
    },
    css: helloWorldCss,
  },
  {
    label: 'Hello To You',
    config: helloToYou,
    views: {
      home: helloToYouHtml
    },
    css: helloToYouCss,
  },
  {
    label: 'Hello To You Custom Form',
    config: helloToYouUnmanaged,
    views: {
      home: helloToYouUnmanagedHtml
    },
    css: helloToYouUnmanagedCss,
  },
  {
    label: 'PageViews By Region',
    config: pageViewsByRegion,
    views: {
      home: pageViewsByRegionHtml
    },
    css: pageViewsByRegionCss,
  },
  {
    label: 'Use Nerdgraph',
    config: useNerdgraph,
    views: {
      home: useNerdgraphHtml
    },
    css: useNerdgraphCss,
  },
  {
    label: 'Status Pages',
    config: statusPages,
    views: {
      home: statusPagesHtml
    },
    css: statusPagesCss,
  },
]
