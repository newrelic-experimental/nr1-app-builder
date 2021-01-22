import React from 'react'
import PropTypes from 'prop-types'
import { Stack, StackItem, HeadingText } from 'nr1'
import { Spinner as Nr1Spinner } from 'nr1'

export default function SpinnerView(props) {
  const { image, heading, message } = props
  return (
    <>
      <Stack
        className="spinner-view"
        verticalType={Stack.VERTICAL_TYPE.CENTER}
        horizontalType={Stack.HORIZONTAL_TYPE.CENTER}
        directionType={Stack.DIRECTION_TYPE.VERTICAL}
        gapType={Stack.GAP_TYPE.NONE}
        fullHeight
        fullWidth
      >
        <StackItem>
          <HeadingText>
            {heading}
          </HeadingText>
        </StackItem>
        <StackItem>
          <div className="spinner">
            {
              image ?
              <img src={image} /> :
              <Nr1Spinner
                type={Nr1Spinner.TYPE.INLINE}
              />
            }
          </div>
        </StackItem>
        <StackItem>
        {
          message &&
            <HeadingText type={HeadingText.TYPE.HEADING_3}>
              {message}
            </HeadingText>
        }
        </StackItem>
      </Stack>
    </>
  )
}

SpinnerView.propTypes = {
  image: PropTypes.string,
  heading: PropTypes.string,
  message: PropTypes.string,
}
