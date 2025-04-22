from bs4 import BeautifulSoup
import requests as req
import pandas as pd

full_dataframe = pd.DataFrame(columns=['Season', 'Episode Number', 'Episode Title', 'Character', 'Dialogue', 'Timestamp', 'TalkingTo'])
season1_episodes = [
    "https://severance.wiki/good_news_about_hell_transcript",
    "https://severance.wiki/half_loop_transcript",
    "https://severance.wiki/in_perpetuity_transcript",
    "https://severance.wiki/the_you_you_are_transcript",
    "https://severance.wiki/the_grim_barbarity_of_optics_and_design_transcript",
    "https://severance.wiki/hide_and_seek_transcript",
    "https://severance.wiki/defiant_jazz_transcript",
    "https://severance.wiki/what_s_for_dinner_transcript",
    "https://severance.wiki/the_we_we_are_transcript"
]
season2_episodes = [
    "https://severance.wiki/s2e1_transcript",
    "https://severance.wiki/s2e2_transcript",
    "https://severance.wiki/s2e3_transcript",
    "https://severance.wiki/s2e4_transcript",
    "https://severance.wiki/s2e5_transcript",
    "https://severance.wiki/s2e6_transcript",
    "https://severance.wiki/s2e7_transcript",
    "https://severance.wiki/s2e8_transcript",
    "https://severance.wiki/s2e9_transcript",
    "https://severance.wiki/s2e10_transcript"
]

episode_name = "Default_Name"

def get_data(url, season, episode, dataframe):
    html_doc = req.get(url)
    if html_doc:
        S = BeautifulSoup(html_doc.content, 'html.parser')
        listOfDialogue = S.find_all('div', class_='wrap_script plugin_wrap')
        episode_name = S.find('h1', class_ = "sectionedit4").text.strip()
        for dialogue in listOfDialogue:
            paragraphs = dialogue.find_all('p')
            for p in paragraphs:
                timestamp = p.find('a')
                if timestamp:
                    time_text = timestamp.text.strip()
                    timestamp.extract()  # Remove the timestamp from the paragraph
                    dialogue_text = p.text.strip()
                    
                    # Split by lines to handle multiple dialogues in one paragraph
                    lines = dialogue_text.split('\n')
                    for line in lines:
                        if ':' in line:  # Ensure the line contains a character and dialogue
                            try:
                                character, text = map(str.strip, line.split(':', 1))
                                # Append to the dataframe using pd.concat
                                new_row = pd.DataFrame([{
                                    'Season': season,
                                    'Episode Number': episode,
                                    'Episode Title': episode_name,
                                    'Character': character,
                                    'Dialogue': text,
                                    'Timestamp': time_text
                                }])
                                dataframe = pd.concat([dataframe, new_row], ignore_index=True)
                                #print(character + ":")
                                #print(text)
                                #print("\n")
                            except ValueError:
                                print(f"Skipping malformed line: {line}")
    else:
        print("Failed to retrieve the page.")
    
    return dataframe

# accessing specific rows and columns
# print(full_dataframe.iloc[4]['Timestamp'] + " - " + full_dataframe.iloc[4]['Character'] + ": " + full_dataframe.iloc[4]['Dialogue'])
# Write the dataframe to a CSV file
# output_filename = espiode_name.replace(" (Transcript)", "").replace(" ", "_").replace(":", "_").replace("/", "_")
# full_dataframe.to_csv(f'./TV-time/episode_transcripts/{output_filename}.csv', index=False)

i = 0
for episode in season1_episodes:
    i+=1
    full_dataframe = pd.DataFrame(get_data(episode, 1, i, full_dataframe))
j = 0
for episode in season2_episodes:
    j+=1
    full_dataframe = pd.DataFrame(get_data(episode, 2, j, full_dataframe))

# Ensure the Timestamp column is sorted and converted to a comparable format
full_dataframe['Timestamp'] = pd.to_datetime(full_dataframe['Timestamp'], format='%H:%M:%S', errors='coerce')

# Drop rows with NaT in the Timestamp column
full_dataframe = full_dataframe.dropna(subset=['Timestamp']).reset_index(drop=True)

# Sort the DataFrame by Season, Episode Number, and Timestamp to ensure proper order
full_dataframe = full_dataframe.sort_values(by=['Season', 'Episode Number', 'Timestamp']).reset_index(drop=True)

# Process the DataFrame to populate the TalkingTo column based on closest timestamp within the same episode
for (season, episode), group in full_dataframe.groupby(['Season', 'Episode Number']):
    group_indices = group.index  # Get the indices of the group
    for i in group_indices:
        current_character = full_dataframe.at[i, 'Character']
        current_timestamp = full_dataframe.at[i, 'Timestamp']
        talking_to = None
        min_time_diff = pd.Timedelta.max  # Initialize with a very large time difference

        # Look for the closest other character in terms of timestamp within the same group
        for j in group_indices:
            if i == j:
                continue  # Skip the current row
            next_character = full_dataframe.at[j, 'Character']
            next_timestamp = full_dataframe.at[j, 'Timestamp']

            # Skip rows with NaT in the Timestamp column
            if pd.isna(next_timestamp) or pd.isna(current_timestamp):
                continue

            time_diff = abs(next_timestamp - current_timestamp)

            if next_character != current_character and time_diff < min_time_diff:
                talking_to = next_character
                min_time_diff = time_diff

        # Assign the found character to the TalkingTo column
        full_dataframe.at[i, 'TalkingTo'] = talking_to

print(full_dataframe.head())  # Display the first few rows of the dataframe

# Write the DataFrame to a CSV file
full_dataframe.to_csv('./data/full_transcript.csv', index=False)