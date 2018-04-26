import React, { Component } from 'react';
import {
  XYPlot,
  XAxis,
  YAxis,
  VerticalGridLines,
  HorizontalGridLines,
  MarkSeries
} from 'react-vis';

const Graph = ({ mapData }) => {
  return(
    <div>
      <XYPlot
        width={550}
        height={400}
        style={{
          position: 'absolute',
          left: 'calc(50vw - 250px)',
        }}
        colorRange={[
          '#ff5d00',
          '#002eff'
        ]}
      >
        <VerticalGridLines/>
        <HorizontalGridLines/>
        <XAxis/>
        <YAxis/>
        <MarkSeries
          data={mapData}
        />
      </XYPlot>
    </div>
  )
}

export default Graph;
