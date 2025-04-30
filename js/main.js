const container = document.getElementById('container');
const verticalSlider = document.getElementById('vertical-slider');
const horizontalSlider = document.getElementById('horizontal-slider');
const left = document.getElementById('left');
const right = document.getElementById('right');
const bottom = document.getElementById('bottom');
const infoIcon = document.getElementById('info-icon');
const infoDialog = document.getElementById('info-dialog');

let heatmap;
let barchart;

let isDraggingVertical = false;
let isDraggingHorizontal = false;

// Character mapping for combining data from multiple aliases into the same character
const characterMapping = {
  // Mark group
  "Mark": "Mark",
  "Innie Mark": "Mark",
  "Mark & Alexa (singing)": "Mark",
  "Mark & Devon": "Mark",
  "Mark (on tape)": "Mark",
  "Mark (singing)": "Mark",
  "Mark (voiceover)": "Mark",
  "Mark S": "Mark",
  "Mark S (voice)": "Mark",
  "Outie Mark": "Mark",

  // Petey group
  "Petey": "Petey",
  "Petey (singing)": "Petey",

  // Ricken group
  "Ricken": "Ricken",
  "Ricken (voicemail)": "Ricken",
  "Ricken (voiceover)": "Ricken",

  // Television group
  "Television": "Television",
  "Television (voice)": "Television",

  // Milchick group
  "Milchick": "Milchick",
  "Milchick (on tape)": "Milchick",
  "Milchick (voicemail)": "Milchick",

  // Ms. Huang group
  "Ms. Huang": "Ms Huang",
  "Miss Huang": "Ms Huang",

  // Cobel group
  "Cobel": "Cobel",
  "Cobel (singing)": "Cobel",

  // Helly group
  "Helly": "Helly",
  "Helly (on video)": "Helly",
  "Helly and Dylan": "Helly",
  "Helly R": "Helly",

  // Dylan group
  "Dylan": "Dylan",
  "Dylan G": "Dylan",
  "Helly and Dylan": "Dylan",

  // Irving group
  "Irving": "Irving",
  "Irving B": "Irving",
  "Irving B (voice)": "Irving",
  "Kier and Irving": "Irving",

  // Jame group
  "Jame": "Jame",
  "Jame Eagan": "Jame",

  // June group
  "June": "June",
  "June (singing)": "June",

  // Kier group
  "Kier": "Kier",
  "Kier Eagan": "Kier",
  "Animatrionic Kier": "Kier",
  "Kier Eagan (recording)": "Kier",
  "Kier and Irving": "Kier"
};


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

// Event listeners for interacting w/ the sliders
verticalSlider.addEventListener('mousedown', () => isDraggingVertical = true);
horizontalSlider.addEventListener('mousedown', () => isDraggingHorizontal = true);

document.addEventListener('mouseup', () => {
    isDraggingVertical = false;
    isDraggingHorizontal = false;
});

// Event listeners for moving the sliders around
document.addEventListener('mousemove', (e) => {
  const containerRect = container.getBoundingClientRect();

  if (isDraggingVertical) {
      const newLeftWidth = e.clientX - containerRect.left;
      const newRightWidth = containerRect.width - newLeftWidth - 10; // 10px for slider

      // Resize containers
      if (newLeftWidth > 0 && newRightWidth > 0) {
          document.getElementById('top-left').style.width = `${newLeftWidth}px`;
          document.getElementById('bottom-left').style.width = `${newLeftWidth}px`;
          document.getElementById('top-right').style.width = `${newRightWidth}px`;
          document.getElementById('bottom-right').style.width = `${newRightWidth}px`;
      }
  }

  if (isDraggingHorizontal) {
      const newTopHeight = e.clientY - containerRect.top;
      const newBottomHeight = containerRect.height - newTopHeight - 10; // 10px for slider

      // Resize containers
      if (newTopHeight > 0 && newBottomHeight > 0) {
          document.getElementById('top-left').style.height = `${newTopHeight}px`;
          document.getElementById('top-right').style.height = `${newTopHeight}px`;
          document.getElementById('bottom-left').style.height = `${newBottomHeight}px`;
          document.getElementById('bottom-right').style.height = `${newBottomHeight}px`;
      }
  }
});

// Set default sizes for the quadrants
function setDefaultSizes() {
  const containerRect = container.getBoundingClientRect();
  const defaultTopHeight = containerRect.height / 2 - 5; // Half height minus slider
  const defaultLeftWidth = containerRect.width / 2 - 5; // Half width minus slider

  document.getElementById('top-left').style.height = `${defaultTopHeight}px`;
  document.getElementById('top-right').style.height = `${defaultTopHeight}px`;
  document.getElementById('bottom-left').style.height = `${defaultTopHeight}px`;
  document.getElementById('bottom-right').style.height = `${defaultTopHeight}px`;

  document.getElementById('top-left').style.width = `${defaultLeftWidth}px`;
  document.getElementById('bottom-left').style.width = `${defaultLeftWidth}px`;
  document.getElementById('top-right').style.width = `${defaultLeftWidth}px`;
  document.getElementById('bottom-right').style.width = `${defaultLeftWidth}px`;
}

// Initialize default sizes on load
window.addEventListener('load', setDefaultSizes);
window.addEventListener('resize', setDefaultSizes); // Adjust sizes on window resize

// Turn nested data into array for heatmap
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

function normalizeCharacter(character) {
  return characterMapping[character.trim()] || character.trim();
}  

d3.csv('data/full_transcript.csv')
  .then(data => {
    const wordCounts = {};
    const characterStats = {};

    // Get the word count for each character in each episode
    data.forEach(row => {
      const season = row['Season'];
      const episode = row['Episode Number'];
      const episodeId = `S${season}E${episode}`;

      let characterField = row['Character']?.trim();
      if (!characterField) return; // Skip if missing

      const dialogue = row['Dialogue'];
      const wordCount = dialogue.trim().split(/\s+/).filter(w => w).length;

      // Handle multiple characters (e.g., "Helly and Dylan")
      let characters = [];

      if (characterField.includes(' and ')) {
        characters = characterField.split(' and ').map(name => normalizeCharacter(name));
      } else if (characterField.includes('&')) {
        characters = characterField.split('&').map(name => normalizeCharacter(name));
      } else {
        characters = [normalizeCharacter(characterField)];
      }

      characters.forEach(character => {
        if (!wordCounts[season]) wordCounts[season] = {};
        if (!wordCounts[season][episode]) wordCounts[season][episode] = {};
        if (!wordCounts[season][episode][character]) wordCounts[season][episode][character] = 0;

        wordCounts[season][episode][character] += wordCount;

        // Initialize character stats if not already present
        if (!characterStats[character]) {
          characterStats[character] = {
            totalWords: 0,
            episodesSpoken: new Set()
          };
        }

        // Keep track of total words spoken by each character and # of episodes they speak in
        characterStats[character].totalWords += wordCount;
        if (wordCount > 0) {
          characterStats[character].episodesSpoken.add(episodeId);
        }
      });
    });

    // Get a list of all unique characters
    const characterSet = new Set();

    data.forEach(row => {
      let characterField = row['Character']?.trim();
      if (characterField) {
        let characters = [];

        if (characterField.includes(' and ')) {
          characters = characterField.split(' and ').map(name => normalizeCharacter(name));
        } else if (characterField.includes('&')) {
          characters = characterField.split('&').map(name => normalizeCharacter(name));
        } else {
          characters = [normalizeCharacter(characterField)];
        }

        characters.forEach(c => characterSet.add(c));
      }
    });

    const characters = Array.from(characterSet).sort();

    // Flatten word counts for heatmap
    const flattened = flattenWordCounts(wordCounts).map(d => ({
      ...d,
      episodeId: `S${d.season}E${d.episode}`
    }));

    // Finalize stats
    Object.values(characterStats).forEach(stat => {
      stat.totalEpisodes = stat.episodesSpoken.size;
      delete stat.episodesSpoken; // Optional: keep only the count
    });

    // Prepare heatmap data
    const heatmapData = {
      characters: characters,
      wordCounts: flattened,
      characterStats: characterStats
    };

    // Initialize visualizations
    heatmap = new Heatmap(heatmapData, { parentElement: '#top-left' });
    arcDiagrams = new arcDiagram(data, { parentElement: '#top-right' });
  })
  .catch(error => console.error(error));

// Load the word count datasets
Promise.all([
    d3.csv('data/total_word_counts.csv'), // Total word counts
    d3.csv('data/character_word_counts.csv') // Character word counts
]).then(([totalWordCounts, characterWordCounts]) => {
    // Prepare total word cloud data
    const totalWordCloudData = totalWordCounts.map(d => ({
        word: d.Word,
        frequency: +d['Word Count'] // Convert count to a number
    }));

    // Prepare character word cloud data
    const characterWordCloudData = characterWordCounts.map(d => ({
        character: d.Character,
        word: d.Word,
        frequency: +d['Word Count'] // Convert count to a number
    }));

    // Initialize the word cloud with total word counts by default
    const wordCloud = new WordCloud(totalWordCloudData, { parentElement: '#bottom-left' });

    // Add filtering logic for character-specific word clouds
    const characterSelect = document.getElementById('character-select'); // Add a dropdown for characters
    characterSelect.addEventListener('change', () => {
        const selectedCharacter = characterSelect.value;
        const filteredData = selectedCharacter === 'all'
            ? totalWordCloudData // Show total word counts if "all" is selected
            : characterWordCloudData.filter(d => d.character === selectedCharacter);
        wordCloud.updateVis(filteredData);
        barchart.updateVis(selectedCharacter);
    });

    // Populate the character dropdown
    const uniqueCharacters = Array.from(new Set(
        characterWordCloudData.map(d => normalizeCharacter(d.character)) // Normalize character names
    )).sort();

    characterSelect.innerHTML = '<option value="all">All Characters</option>';
    uniqueCharacters.forEach(character => {
        const option = document.createElement('option');
        option.value = character;
        option.textContent = character;
        characterSelect.appendChild(option);
    });
}).catch(error => console.error(error));
d3.csv('data/severance_instances.csv')
.then(data  => {
  barchart = new Barchart(data, { parentElement: '#bottom-right', mapping: characterMapping })
});
// Add event listener for the "Include 'you'" toggle
document.getElementById('include-you-toggle').addEventListener('change', () => {
    location.reload(); // Refresh the page when the toggle is changed
});
