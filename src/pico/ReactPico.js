import React, { Component } from 'react';
import pico from './pico';
import camvas from './camvas';

const rgba_to_grayscale = (rgba, nrows, ncols) => {
  const gray = new Uint8Array(nrows*ncols);
  for(let r=0; r<nrows; ++r)
    for(let c=0; c<ncols; ++c)
      gray[r*ncols + c] = (2*rgba[r*4*ncols+4*c+0]+7*rgba[r*4*ncols+4*c+1]+1*rgba[r*4*ncols+4*c+2])/10;
  return gray;
}

class ReactPico extends Component {
  state = {
    faceFinder: null,
    updateMemory: pico.instantiate_detection_memory(5),
  };
  constructor(props) {
    super(props);
    this.canvasRef = React.createRef();
  }

  componentDidMount() {
    this.loadFaceFinder();
  }
  loadFaceFinder() {
    const cascadeurl = 'https://raw.githubusercontent.com/nenadmarkus/pico/c2e81f9d23cc11d1a612fd21e4f9de0921a5d0d9/rnt/cascades/facefinder';
    fetch(cascadeurl).then((response) => {
      response.arrayBuffer().then((buffer) => {
        var bytes = new Int8Array(buffer);
        this.setState({
          faceFinder: pico.unpack_cascade(bytes)
        });
        new camvas(this.canvasRef.current.getContext('2d'), this.processVideo);
      });
    });
  }

  processVideo = (video, dt) => {
    if(this.state.faceFinder && this.props.onFaceFound) {
      const ctx = this.canvasRef.current.getContext('2d');
      const updateMemory = this.state.updateMemory;
      // render the video frame to the canvas element and extract RGBA pixel data
      ctx.drawImage(video, 0, 0);
      var rgba = ctx.getImageData(0, 0, 640, 480).data;
      // prepare input to `run_cascade`
      let image = {
        "pixels": rgba_to_grayscale(rgba, 480, 640),
        "nrows": 480,
        "ncols": 640,
        "ldim": 640
      }
      let params = {
        "shiftfactor": 0.1, // move the detection window by 10% of its size
        "minsize": 100,     // minimum size of a face
        "maxsize": 1000,    // maximum size of a face
        "scalefactor": 1.1  // for multiscale processing: resize the detection window by 10% when moving to the higher scale
      }
      // run the cascade over the frame and cluster the obtained detections
      // dets is an array that contains (r, c, s, q) quadruplets
      // (representing row, column, scale and detection score)
      let dets = pico.run_cascade(image, this.state.faceFinder, params);
      dets = updateMemory(dets);
      dets = pico.cluster_detections(dets, 0.2); // set IoU threshold to 0.2
      // draw detections
      for(let i = 0; i < dets.length; ++i) {
        // check the detection score
        // if it's above the threshold, draw it
        // (the constant 50.0 is empirical: other cascades might require a different one)
        if(dets[i][3]>50.0) {
          this.props.onFaceFound({
            x: 640 - dets[i][1],
            y: dets[i][0],
            radius: dets[i][2],
            xRatio: (640 - dets[i][1]) / 640,
            yRatio: dets[i][0] / 480,
            totalX: (640 - dets[i][1]) / 640 * window.innerWidth,
            totalY: dets[i][0] / 480 * window.innerHeight,
          });
        }
      }
    }
  };
  render() {
    return (
      <div>
        <canvas ref={this.canvasRef} width={640} height={480} style={{visibility: 'hidden'}}></canvas>
      </div>
    )
  }
}

export default ReactPico;
