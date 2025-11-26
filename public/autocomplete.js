let lunrIndex;
let apiData = [];
let selectedIndex = -1;

async function initAutocomplete() {
  const [indexRes, dataRes] = await Promise.all([
    fetch('/index.json'),
    fetch('/data.json')
  ]);

  const indexJson = await indexRes.json();
  apiData = await dataRes.json();
  lunrIndex = lunr.Index.load(indexJson);

  const input = document.getElementById('search-input');
  const resultsContainer = document.getElementById('autocomplete-results');

  function renderResults(results, query) {
    resultsContainer.innerHTML = '';
    selectedIndex = -1;

    results.forEach((result, i) => {
      const doc = apiData[result.ref];
      const item = document.createElement('div');
      item.className = 'autocomplete-item';
      const regex = new RegExp(`(${query})`, 'gi');
      item.innerHTML = `<strong>${doc.api_name.replace(regex, '<mark>$1</mark>')}</strong> — ${doc.description.replace(regex, '<mark>$1</mark>')}`;
      resultsContainer.appendChild(item);

      item.addEventListener('click', () => {
        window.open(doc.url, '_blank');
      });
    });
  }

  input.addEventListener('input', () => {
    const query = input.value.trim();
    if (!query) {
      resultsContainer.innerHTML = '';
      return;
    }
    const results = lunrIndex.search(`${query}*`).slice(0, 10);
    renderResults(results, query);
  });

  input.addEventListener('keydown', (e) => {
    const items = resultsContainer.querySelectorAll('.autocomplete-item');
    if (!items.length) return;

    if (e.key === 'ArrowDown') {
      selectedIndex = (selectedIndex + 1) % items.length;
      updateSelection(items);
      e.preventDefault();
    } else if (e.key === 'ArrowUp') {
      selectedIndex = (selectedIndex - 1 + items.length) % items.length;
      updateSelection(items);
      e.preventDefault();
    } else if (e.key === 'Enter') {
      if (selectedIndex >= 0 && selectedIndex < items.length) {
        items[selectedIndex].click();
      }
    }
  });

  function updateSelection(items) {
    items.forEach((item, i) => {
      item.classList.toggle('selected', i === selectedIndex);
    });
  }
}

document.addEventListener('DOMContentLoaded', initAutocomplete);
