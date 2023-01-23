import Plotly from 'plotly.js-dist-min';

import './style.css';

const djb2 = (str) => {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) + hash + str.charCodeAt(i);
  }
  return hash;
};

const hashStringToColor = (str) => {
  const hash = djb2(str);
  const r = (hash & 0xff0000) >> 16;
  const g = (hash & 0x00ff00) >> 8;
  const b = hash & 0x0000ff;
  return (
    '#' +
    ('0' + r.toString(16)).substr(-2) +
    ('0' + g.toString(16)).substr(-2) +
    ('0' + b.toString(16)).substr(-2)
  );
};

d3.json('/data.json', (err, rows) => {
  const unpack = (categoryData, key) => categoryData.map((row) => row[key]);
  const getColor = (categoryData) =>
    categoryData.map((row) => hashStringToColor(row.Category));
  const getTooltip = (categoryData) =>
    categoryData.map(
      (row) =>
        `<b>Category:</b> ${row.Category} <br>` +
        `<b>Animal:</b> ${row.Animal} <br>` +
        `<b>Movie:</b> ${row.Film} (${row.Year}) <br>` +
        `<b>Location:</b> ${row.Location}`,
    );

  const data = Object.values(rows).map((categoryData) => {
    return {
      hovermode: 'closest',
      type: 'scattermapbox',
      text: getTooltip(categoryData),
      lon: unpack(categoryData, 'Long'),
      lat: unpack(categoryData, 'Lat'),
      hovertemplate: `%{text}<extra></extra>`,
      marker: { color: getColor(categoryData), size: 8 },
      name: categoryData[0].Category,
      showlegend: true,
    };
  });

  const layout = {
    title: 'Where natural horror films takes place',
    dragmode: 'zoom',
    mapbox: {
      style: 'carto-darkmatter',
      center: { lat: 38, lon: -90 },
      zoom: 2,
    },
    margin: { r: 0, t: 0, b: 0, l: 0 },
    legend: {
      orientation: 'h',
      y: 0.25,
      x: 0.05,
      bgcolor: '#000',
      borderColor: '#282828',
      borderRadius: '8px',
    },
    config: { responsive: true },
  };

  Plotly.newPlot('app', data, layout);
});
