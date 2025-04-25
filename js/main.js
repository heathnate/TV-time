const container = document.getElementById('container');
const verticalSlider = document.getElementById('vertical-slider');
const horizontalSlider = document.getElementById('horizontal-slider');
const left = document.getElementById('left');
const right = document.getElementById('right');
const bottom = document.getElementById('bottom');
const infoIcon = document.getElementById('info-icon');
const infoDialog = document.getElementById('info-dialog');

let heatmap;

let isDraggingVertical = false;
let isDraggingHorizontal = false;

// Show/hide info dialog
infoIcon.addEventListener('click', (e) => {
    e.stopPropagation(); // Prevent the click from propagating to the document
    if (infoDialog.style.display === 'none' || !infoDialog.style.display) {
        infoDialog.style.display = 'block';
    } else {
        infoDialog.style.display = 'none';
    }
});

// Hide info dialog when clicking outside of it
document.addEventListener('click', (e) => {
    if (infoDialog.style.display === 'block' && !infoDialog.contains(e.target) && e.target !== infoIcon) {
        infoDialog.style.display = 'none';
    }
});

verticalSlider.addEventListener('mousedown', () => isDraggingVertical = true);
horizontalSlider.addEventListener('mousedown', () => isDraggingHorizontal = true);

document.addEventListener('mouseup', () => {
    isDraggingVertical = false;
    isDraggingHorizontal = false;
});

document.addEventListener('mousemove', (e) => {
    if (isDraggingVertical) {
        const containerRect = container.getBoundingClientRect();
        const newLeftWidth = e.clientX - containerRect.left;
        const newRightWidth = containerRect.width - newLeftWidth - 10; // 10px for slider
        if (newLeftWidth > 0 && newRightWidth > 0) {
            left.style.width = `${newLeftWidth}px`;
            right.style.width = `${newRightWidth}px`;
        }
    }

    if (isDraggingHorizontal) {
        const containerRect = container.getBoundingClientRect();
        const newTopHeight = e.clientY - containerRect.top;
        const newBottomHeight = containerRect.height - newTopHeight - 10; // 10px for slider
        if (newTopHeight > 0 && newBottomHeight > 0) {
            document.getElementById('top').style.height = `${newTopHeight}px`;
            bottom.style.height = `${newBottomHeight}px`;
        }
    }
});

// Set default sizes for the quadrants
function setDefaultSizes() {
    const containerRect = container.getBoundingClientRect();
    const defaultTopHeight = containerRect.height / 2 - 5; // Half height minus slider
    const defaultLeftWidth = containerRect.width / 2 - 5; // Half width minus slider

    document.getElementById('top').style.height = `${defaultTopHeight}px`;
    left.style.width = `${defaultLeftWidth}px`;
    right.style.width = `${defaultLeftWidth}px`;
    bottom.style.height = `${defaultTopHeight}px`;
}

// Initialize default sizes on load
window.addEventListener('load', setDefaultSizes);
window.addEventListener('resize', setDefaultSizes); // Adjust sizes on window resize

// Simple CSV line parser that handles quoted fields
function parseCSVLine(line) {
    const result = [];
    let current = '';
    let inQuotes = false;
  
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"' && line[i + 1] === '"') {
        current += '"'; // Handle escaped quotes
        i++; // Skip the next quote
      } else if (char === '"') {
        inQuotes = !inQuotes; // Toggle inQuotes
      } else if (char === ',' && !inQuotes) {
        result.push(current);
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current); // Add last field
    return result;
}

function flattenWordCounts(wordCounts) {
    const flatData = [];
  
    for (const season in wordCounts) {
      const episodes = wordCounts[season];
      for (const episode in episodes) {
        const characters = episodes[episode];
        for (const character in characters) {
          flatData.push({
            season: +season,
            episode: +episode,
            character: character,
            value: characters[character]
          });
        }
      }
    }
  
    return flatData;
}
  

d3.csv('data/full_transcript.csv')
  .then(data => {
    const wordCounts = {};

    // Get the word count for each character in each episode
    data.forEach(row => {
      const season = row['Season'];
      const episode = row['Episode Number'];
      const character = row['Character'];
      const dialogue = row['Dialogue'];

      const wordCount = dialogue.trim().split(/\s+/).filter(w => w).length;

      if (!wordCounts[season]) wordCounts[season] = {};
      if (!wordCounts[season][episode]) wordCounts[season][episode] = {};
      if (!wordCounts[season][episode][character]) wordCounts[season][episode][character] = 0;

      wordCounts[season][episode][character] += wordCount;
    });

    // Get a list of all unique characters
    const characterSet = new Set();

    data.forEach(row => {
      const character = row['Character']?.trim();
      if (character) {
        characterSet.add(character);
      }
    });

    const characters = Array.from(characterSet).sort();

    // Flatten word counts for heatmap
    const flattened = flattenWordCounts(wordCounts).map(d => ({
      ...d,
      episodeId: `S${d.season}E${d.episode}`
    }));

    // Prepare heatmap data
    const heatmapData = {
      characters: characters,
      wordCounts: flattened
    };

    // Prepare word cloud data
    const wordCloudData = data.flatMap(row => {
      const season = row['Season'];
      const episode = row['Episode Number'];
      const character = row['Character'];
      const dialogue = row['Dialogue'];

      const words = dialogue.trim().split(/\s+/).filter(w => w);
      return words.map(word => ({
        season,
        episode,
        character,
        word,
        frequency: 1 // Each word appears once in the dialogue
      }));
    });

    // Aggregate word frequencies for the word cloud
    const aggregatedWordCloudData = d3.rollups(
      wordCloudData,
      v => v.length,
      d => `${d.season}-${d.episode}-${d.character}-${d.word}`
    ).map(([key, frequency]) => {
      const [season, episode, character, word] = key.split('-');
      return { season, episode, character, word, frequency };
    });

    // Initialize visualizations
    const heatmap = new Heatmap(heatmapData, { parentElement: '#left' });
    //const wordCloud = new WordCloud(aggregatedWordCloudData, { parentElement: '#bottom-left' });

    // Add filtering logic for the word cloud
    const seasonSelect = document.getElementById('season-select');
    seasonSelect.addEventListener('change', () => {
      const selectedSeason = seasonSelect.value;
      const filteredData = aggregatedWordCloudData.filter(d =>
        selectedSeason === 'all' || d.season === selectedSeason.replace('season', '')
      );
      wordCloud.updateVis(filteredData);
    });
  })
  .catch(error => console.error(error));
