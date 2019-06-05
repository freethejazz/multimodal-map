import React, { Component } from 'react';
import { Map, TileLayer } from 'react-leaflet'
import annyang from 'annyang';
import './App.css';

class App extends Component {
  state = {
    center: [41.878099, -87.648116],
    zoom: 12,
  };
  updateViewport = (viewport) => {
    this.setState({
      center: viewport.center,
      zoom: viewport.zoom,
    });
  };
  zoomTo = (zoomLevel) => {
    this.setState({
      zoom: +zoomLevel,
    });
  }
  zoomIn = () => {
    this.setState({
      zoom: this.state.zoom + 1
    });
  };
  zoomOut = (...args) => {
    this.setState({
      zoom: this.state.zoom - 1
    });
  };
  componentDidMount() {
    annyang.addCommands({
      'in': this.zoomIn,
      'out': this.zoomOut,
      'zoom level :level': {regexp: /^zoom level (\d+)/, callback: this.zoomTo},
    });
    annyang.start();
  }
  render() {
    const {
      center,
      zoom,
    } = this.state;
    return (
      <div className="App">
        <Map
          style={{height: '100%', width: '100%'}}
          center={center}
          zoom={zoom}
          onViewportChange={this.updateViewport}>
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="&copy; <a href=&quot;http://osm.org/copyright&quot;>OpenStreetMap</a> contributors"
          />
        </Map>
      </div>
    )
  }
}

export default App;
