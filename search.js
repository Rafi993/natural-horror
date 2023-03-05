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
          <a href="${item.link}" target="_blank">${item.movie} (${item.year})</a>
          <tag>${item.category}</tag>
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

export const handleSearch = (data) => (event) => {
  const searchTerm = event.target.value.toLowerCase();

  if (searchTerm.length === 0) {
    hideSearch();
    return;
  }

  const result = data.filter((item) =>
    item.movie.toLowerCase().includes(searchTerm),
  );

  renderSearch(result);
};
