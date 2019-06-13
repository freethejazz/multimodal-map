import React from 'react';

export default ({x, y}) => {
  return (
    <div style={{
      position: 'absolute',
      left: x,
      top: y,
      width: 10,
      height: 10,
      backgroundColor: 'red',
      opacity: .8,
      borderRadius: 5,
      zIndex: 1000,
    }} />
  )
}
