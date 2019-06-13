import React, { Component } from 'react';
import { Map, TileLayer } from 'react-leaflet'
import annyang from 'annyang';
import { OpenStreetMapProvider } from 'leaflet-geosearch';
import './App.css';
import ReactPico from './pico/ReactPico';
import FaceIndicator from './FaceIndicator';

class App extends Component {
  state = {
    center: [41.878099, -87.648116],
    zoom: 12,
    geocoder: new OpenStreetMapProvider(),
    face: null,
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
  zoomOut = () => {
    this.setState({
      zoom: this.state.zoom - 1
    });
  };
  flyTo = (name) => {
    console.log(name);
    this.state.geocoder
      .search({ query: name })
      .then((result) => {
        if(result.length) {
          this.setState({
            center: [parseFloat(result[0].y), parseFloat(result[0].x)]
          });
        }
      });
  };
  componentDidMount() {
    // Enable voice commands
    annyang.addCommands({
      'zoom in': this.zoomIn,
      'zoom out': this.zoomOut,
      'zoom level :level': {regexp: /^zoom level (\d+)/, callback: this.zoomTo},
      'fly to *address': this.flyTo,
    });
    annyang.start();
  }
  render() {
    const {
      center,
      zoom,
      face,
    } = this.state;
    return (
      <div className="App">
        <Map
          style={{
            height: '100%',
            width: '100%',
          }}
          center={center}
          zoom={zoom}
          onViewportChange={this.updateViewport}>
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="&copy; <a href=&quot;http://osm.org/copyright&quot;>OpenStreetMap</a> contributors"
          />
        </Map>
        <ReactPico onFaceFound={(face) => {this.setState({face})}} />
        {face && <FaceIndicator x={face.totalX} y={face.totalY} />}
      </div>
    )
  }
}

export default App;
