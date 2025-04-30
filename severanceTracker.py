import pandas as pd
import string

severance = ['sever','severed','severing','severance']

# Read the CSV file
df = pd.read_csv('./data/full_transcript.csv')

# Collect the character name, instance number, season and episode numbers
data = []

instance = 0

# Iterate over rows of the DataFrame
for _, row in df.iterrows():
    character = row['Character']
    dialogue = row['Dialogue']
    season = row['Season']
    episode = (row['Episode Number'], row['Episode Title'][:-13])
    
    # Loop over everyt word
    for word in dialogue.split():
        # Remove punctuation from the word
        cleaned_word = word.strip(string.punctuation).lower()
        if cleaned_word.isalpha():  # Check if the cleaned word contains only alphabetic characters

            # If
            if cleaned_word in severance:
                instance += 1
                data.append({"Character": character,
                             "Season": season,
                             "Episode_num": episode[0],
                             "Episode_title": episode[1],
                             "Instance": instance,
                             "Dialogue": dialogue})

output_df = pd.DataFrame(data)

output_df.to_csv('./data/severance_instances.csv')


