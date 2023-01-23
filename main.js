import Plotly from 'plotly.js-dist-min';
import ColorHash from 'color-hash';

import './style.css';

d3.json('/data.json', (err, rows) => {
  const colorHash = new ColorHash({ lightness: 0.5 });

  const unpack = (categoryData, key) => categoryData.map((row) => row[key]);
  const getColor = (categoryData) =>
    categoryData.map((row) => colorHash.hex(row.Category));
  const getTooltip = (categoryData) =>
    categoryData.map((row) => [
      `<b>Category:</b> ${row.Category} <br>` +
        `<b>Animal:</b> ${row.Animal} <br>` +
        `<b>Movie:</b> ${row.Film} (${row.Year}) <br>` +
        `<b>Location:</b> ${row.Location} <br>`,
      row.Link,
    ]);

  const data = Object.values(rows).map((categoryData) => {
    return {
      hovermode: 'closest',
      type: 'scattermapbox',
      text: getTooltip(categoryData),
      lon: unpack(categoryData, 'Long'),
      lat: unpack(categoryData, 'Lat'),
      hovertemplate: `%{text[0]}<extra></extra>`,
      marker: { color: getColor(categoryData), size: 8, cursor: 'pointer' },
      name: categoryData[0].Category,
      showlegend: true,
      link: unpack(categoryData, 'Link'),
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

  const mapPlot = document.getElementById('app');
  Plotly.newPlot('app', data, layout);
  mapPlot.on('plotly_click', (data) => {
    const link = data.points[0].data.link[0];

    if (link) {
      window.open(link, '_blank');
    }
  });
});
