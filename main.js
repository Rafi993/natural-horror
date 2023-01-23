import Plotly from 'plotly.js-dist-min';
import ColorHash from 'color-hash';

import './style.css';

const renderSearch = (result) => {
  const mapPlot = document.getElementById('map');
  mapPlot.style.display = 'none';
  const searchResult = document.getElementById('searchResult');
  searchResult.style.display = 'block';
  clearSearch();

  for (const item of result) {
    const li = document.createElement('li');
    li.innerHTML = `
     <div>
        <a href="${item.Link}" target="_blank">${item.Film}(${item.Year})</a>
        <tag>${item.Category}</tag>
     </div>
    `;

    searchResult.appendChild(li);
  }

  if (result.length === 0) {
    const li = document.createElement('li');
    li.innerHTML = `
     <div>
        <h2>Try searching something else</h2>
     </div>
    `;

    searchResult.appendChild(li);
  }
};

const hideSearch = () => {
  const mapPlot = document.getElementById('map');
  mapPlot.style.display = 'block';
  const searchResult = document.getElementById('searchResult');
  searchResult.style.display = 'none';
  clearSearch();
};

const clearSearch = () => {
  searchResult.replaceChildren();
};

d3.json('/data.json', (err, rows) => {
  const colorHash = new ColorHash({ lightness: 0.5, saturation: 0.6 });

  const search = document.getElementById('search');
  search.addEventListener('keyup', (event) => {
    const searchTerm = event.target.value.toLowerCase();

    if (searchTerm.length === 0) {
      hideSearch();
      return;
    }

    console.log(
      searchTerm,
      Object.values(rows).reduce((acc, item) => [...acc, ...item], []),
    );

    const result = Object.values(rows)
      .reduce((acc, item) => [...acc, ...item], [])
      .filter((item) => item.Film.toLowerCase().includes(searchTerm));

    renderSearch(result);
  });

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
      name: `${categoryData[0].Category} (${categoryData.length})`,
      showlegend: true,
      link: unpack(categoryData, 'Link'),
    };
  });

  const layout = {
    title: 'Where natural horror films takes place',
    dragmode: 'zoom',
    mapbox: {
      style: 'open-street-map',
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
      borderwidth: 2,
      borderRadius: 8,
      font: {
        family: 'sans-serif',
        size: 14,
        color: '#fff',
      },
    },
    config: { responsive: true },
  };

  const mapPlot = document.getElementById('map');
  Plotly.newPlot('map', data, layout);
  mapPlot.on('plotly_click', (data) => {
    const link = data.points[0].data.link[0];

    if (link) {
      window.open(link, '_blank');
    }
  });
});
