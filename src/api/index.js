// imports
import { parse } from 'papaparse';
import url from 'url';
import qs from 'qs';
// relative imports
// globals
// helper functions
// fetches station metadata
const fetchStations = network => {
  return new Promise((resolve, reject) => {
    // check localstorage
    const cachedMetaString = window.localStorage.getItem('stationMeta');
    let cachedMeta;
    if (typeof cachedMetaString === 'string') cachedMeta = JSON.parse(cachedMetaString);
    // dont use cache if over a day old
    if (cachedMeta && Date.now() - cachedMeta.cachedAt < 8.64e7) {
      return resolve({
        stations: cachedMeta.stations,
        stationids: cachedMeta.stationids,
      });
    }

    const url = `https://mesonet.agron.iastate.edu/sites/networks.php?network=${network}&format=csv&nohtml=on`;
    const fetchOptions = {
      mode: 'cors',
    };
    // stations is object with station id's as keys and
    // station metadata inside each value
    // used to cross-reference and add metadata to weather array
    const stations = {};
    const stationids = [];
    window
      .fetch(url, fetchOptions)
      .then(res => res.text())
      .then(body => {
        const parseOptions = {
          header: true,
          step: ({data}) => {
            const c = data[0];
            const stationID = c.station;
            // add station id to list of station id's
            stationids.push(stationID);
            // remove station id from meta object
            const {...value} = c;
            // add meta object to stations object
            stations[stationID] = value;
          },
          complete: () => resolve({stations, stationids}),
        };
        parse(body);
      });
  });
};
const createWeatherURL = async (startDate, endDate, network) => {
  // BEGIN QUERYSTRING CREATION
  let queryString = '';
  // add network to querystring
  queryString += `network=${network}`;
  // create stations ready for querystring
  const {stations, stationids} = await fetchStations(network);
  const stationidsQueryStrings = stationids.map(s => `stations=${s}`);
  [...stationidsQueryStrings].map(s => (queryString += `&${s}`));
  // create date bounds for querystring
  const dateBounds = {
    year1: startDate.getFullYear(),
    month1: startDate.getMonth() + 1,
    day1: startDate.getDate(),
    year2: endDate.getFullYear(),
    month2: endDate.getMonth() + 1,
    day2: endDate.getDay(),
  };
  queryString += '&' + qs.stringify(dateBounds);
  // END QUERYSTRING CREATION

  // BEGIN  URL CREATION
  const weatherURLObj = {
    protocol: 'https',
    host: 'mesonet.agron.iastate.edu',
    pathname: '/cgi-bin/request/daily.py',
    search: '?' + queryString,
  };
  const weatherURL = url.format(weatherURLObj);
  // END  URL CREATION
  // RETURN
  return weatherURL;
};
const parseIowaCSV = (csv, network) => {
  return new Promise(async (resolve, reject) => {
    // get stations (for metadata)
    const {stations, stationids} = await fetchStations(network);
    const stationData = [];
    parse(csv, {
      header: true,
      step: ({data}) => {
        const c = data[0];
        const stationID = c.station;
        const meta = stations[stationID];
        // remove keys that are "None"
        const filteredChunk = {};
        Object.keys(c).map(k => {
          if (c[k] !== 'None') filteredChunk[k] = c[k];
        });
        const output = { ...filteredChunk, ...meta};
        if (output.station !== "") stationData.push(output);
      },
      complete: () => resolve(stationData),
    });
  });
};
// module function
const fetchWeather = async (
  // today (now)
  startDate = new Date('2018-01-01T23:11:37+00:00'),
  // yesterday (24 hours ago)
  endDate = new Date('2018-01-02T23:11:37+00:00'),
  network = 'OR_COOP',
) => {
  return new Promise(async (resolve, reject) => {
    const weatherURL = await createWeatherURL(startDate, endDate, network);
    const fetchOptions = {
      mode: 'cors',
    };
    window
      .fetch(weatherURL, fetchOptions)
      .then(res => res.text())
      .then(text => parseIowaCSV(text, network))
      .then(data => {
        return resolve(data);
      });
  });
};
// module export
export {fetchWeather};
