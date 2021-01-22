import React, { Component } from 'react'
import {
  Map,
  TileLayer,
  CircleMarker,
} from 'react-leaflet'
import {
  $,
  propsToCamel,
} from '../../util'

export default class Leaflet extends Component {
  render() {
    const {
        action,
        context,
      } = this.props

    const newAction = propsToCamel(action), {
        pointGroups,
        ...other
      } = newAction

    if (!pointGroups) {
      return <div />
    }

    return (
      <Map { ...other }>
        <TileLayer
          attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {
          pointGroups.reduce((accum, group, index) => {
            const points = $(context, group.points)

            if (points) {
              points.forEach((pt, index2) => {
                accum.push(
                  <CircleMarker
                    key={`circle-${index}-${index2}`}
                    center={[pt.lat, pt.lng]}
                    color={group.color}
                    radius={Math.log(pt.weight * (group.radius_factor || 4))}
                    /*
                    onClick={() => {
                      alert(JSON.stringify(pt));
                    }}
                    */
                  />
                )
              })
            }

            return accum
          }, [])
        }
      </Map>
    )
  }
}
