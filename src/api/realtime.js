const axios = require('axios').default;

const WORLDTRADINGDATA_URL = 'https://www.worldtradingdata.com/api/v1/stock?symbol=';

async function fetchData(query, API_TOKEN) {
  try {
    return await axios.get(`${WORLDTRADINGDATA_URL}${query}${API_TOKEN}`)
      .then(response => response.data)
      .catch((error) => {
        throw new Error(error);
      });
  } catch (error) {
    throw error;
  }
}

async function multipleSymbols(symbols, API_TOKEN) {
  const data = [];
  const iterations = Math.ceil(symbols.length / 5);
  for (let i = 0; i < iterations; i += 1) {
    const currentIndex = 5 * i;
    const query = symbols.slice(currentIndex, currentIndex + 5).join(',');
    const fetchedData = fetchData(query, API_TOKEN);
    data.push(fetchedData);
  }
  return Promise.all(data);
}

async function realtime({ symbols, API_TOKEN }) {
  if (symbols === undefined) {
    throw new Error('No symbols provided, add symbols as an argument');
  }
  if (API_TOKEN === undefined) {
    throw new Error('No API_TOKEN provided, add your API_TOKEN from https://www.worldtradingdata.com/ as an argument');
  }
  try {
    const API_TOKEN_URL = `&api_token=${API_TOKEN}`;
    if (typeof symbols === 'string') {
      return await fetchData(symbols, API_TOKEN_URL);
    }
    const mergeData = { symbols_requested: 0, symbols_returned: 0, data: [] };
    const fetchedData = await multipleSymbols(symbols, API_TOKEN_URL);
    for (const dataObject of fetchedData) { // eslint-disable-line no-restricted-syntax
      mergeData.symbols_requested += dataObject.symbols_requested;
      mergeData.symbols_returned += dataObject.symbols_returned;
      mergeData.data = mergeData.data.concat(dataObject.data);
    }
    return mergeData;
  } catch (error) {
    throw new Error(error);
  }
}

module.exports = realtime;