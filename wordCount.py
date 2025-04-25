import pandas as pd
import string

# Read the CSV file
df = pd.read_csv('./data/full_transcript.csv')

# Collect rows in a list for better performance
rows = []

# Iterate over rows of the DataFrame
for _, row in df.iterrows():
    character = row['Character']
    dialogue = row['Dialogue']
    for word in dialogue.split():
        # Remove punctuation from the word
        cleaned_word = word.strip(string.punctuation).lower()
        if cleaned_word.isalpha():  # Check if the cleaned word contains only alphabetic characters
            rows.append({
                'Character': character,
                'Word': cleaned_word,
                'Word Count': 1
            })

# Create the DataFrame from the collected rows
output_df = pd.DataFrame(rows)

# Group by Character and Word to count occurrences
character_word_counts = output_df.groupby(['Character', 'Word'], as_index=False)['Word Count'].sum()

# Group by Word to count total occurrences
word_counts = output_df.groupby('Word', as_index=False)['Word Count'].sum()

# Save the resulting DataFrames to CSV files
character_word_counts.to_csv('./data/character_word_counts.csv', index=False)
word_counts.to_csv('./data/total_word_counts.csv', index=False)