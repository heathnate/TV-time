from bs4 import BeautifulSoup
import requests as req
import pandas as pd

full_dataframe = pd.DataFrame(columns=['Season', 'Episode', 'Character', 'Dialogue', 'Timestamp'])

html_doc = req.get("https://severance.wiki/good_news_about_hell_transcript")
espiode_name = "Default_Name"

if html_doc:
    S = BeautifulSoup(html_doc.content, 'html.parser')
    listOfDialogue = S.find_all('div', class_='wrap_script plugin_wrap')
    espiode_name = S.find('h1', class_ = "sectionedit4").text.strip()
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
                                'Season': 1,
                                'Episode': 1,
                                'Character': character,
                                'Dialogue': text,
                                'Timestamp': time_text
                            }])
                            full_dataframe = pd.concat([full_dataframe, new_row], ignore_index=True)
                            #print(character + ":")
                            #print(text)
                            #print("\n")
                        except ValueError:
                            print(f"Skipping malformed line: {line}")
else:
    print("Failed to retrieve the page.")

# accessing specific rows and columns
print(full_dataframe.iloc[4]['Timestamp'] + " - " + full_dataframe.iloc[4]['Character'] + ": " + full_dataframe.iloc[4]['Dialogue'])
# Write the dataframe to a CSV file
output_filename = espiode_name.replace(" (Transcript)", "").replace(" ", "_").replace(":", "_").replace("/", "_")
full_dataframe.to_csv(f'./TV-time/episode_transcripts/{output_filename}.csv', index=False)