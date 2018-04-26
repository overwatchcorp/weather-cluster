import React, {Component} from 'react';
import math from 'mathjs';
import {fetchWeather} from './api';
import Graph from './components/Graph';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      loaded: false,
      error: null,
      data: null,
    };
  }
  componentWillMount() {
    // fetch weather, then send to state
    fetchWeather()
      .then(data => {
        this.setState({
          loading: false,
          loaded: true,
          error: null,
          data,
        });
      })
      // catch errors if there is an api error
      .catch(err => {
        this.setState({
          loading: false,
          loaded: false,
          error: err,
          data: null,
        });
      });
  }
  render() {
    let mapData, tempMean, precipMean;
    if (this.state.data) {
      console.log(this.state.data);
      const temps = this.state.data.map(s => s.climo_high_f);
      const precip = this.state.data.map(s => s.climo_precip_in);
      tempMean = math.mean(temps);
      precipMean = math.mean(precip);
      mapData = this.state.data.map(s => ({
        stid: s.station,
        type: 'station',
        size: (s.climo_precip_in > precipMean) ? 1 : 0,
        color: (s.climo_high_f > tempMean) ? 1 : 0,
        y: s.lat,
        x: s.lon,
      }));
    }
    return (
      <div
        className="App"
        style={{
          marginTop: 10,
          textAlign: 'center',
          paddingTop: 10,
        }}>
        {this.state.error ? (
          <div>
            Oh no my dude there's an e r r o r
            {JSON.stringify(this.state.error)}
          </div>
        ) : null}
        {this.state.loaded && !this.state.error && this.state.data ? (
          <div>
            <div>
              <h1>JANUARY FIRST 2018'S WEATHER DICHOTOMY</h1>
              <h2>IN OREGON</h2>
              <h3>key</h3>
              <ul style={{ listStyle: 'none' }}>
                <li>big blue circle: COLD AND RAINY</li>
                <li>big orange circle: HOT AND RAINY</li>
                <li>small blue circle: COLD AND DRY</li>
                <li>small orange circle: HOT AND DRY</li>
              </ul>
            </div>
            <Graph mapData={mapData} />
            <p>temperature mean: {Math.floor(tempMean * 10) / 10} degrees fairenheight</p>
            <p>precipitation mean: {Math.floor(precipMean * 1000) / 1000} inches</p>
          </div>
        ) : (
          <h2>Loading...</h2>
        )}
      </div>
    );
  }
}

export default App;
