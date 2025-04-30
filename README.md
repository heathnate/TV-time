<h1>Documentation:</h1>
<h2>Motivation:</h2>
<p>
  This visualization and site we created can be very informational for viewers of the show Severance to gain perspective on which characters are main / have the most dialogue, and it can also be helpful for understanding main themes. The show is based on the premise
  of creating a new personaily and almost person inside a person designed to just work and nothing else, so having something like a word cloud can be indicative as the most said word by a long shot is you which is a major part of the show, discovering who "you" are
  and what "you" should be. One of the most repeated phrases that comes to mind for this example is the repeated line "who are you" which can be seen in the word cloud as recurring words. The visualizations can also be helpful for determining when characters are important,
  such as a character Petey being super prevalent in season 1 episode 3, and he dissapears in episode 5 never to be seen again except for in a flashback in season 2 episode 3 which is the next dialogue he gets. The arc diagram allows you to determine which people are more      closely related in the show as you can tell from heavy bundles of lines between two characters that they have a lot of dialogue together. This can all help a viewer to gain some more understanding of the show and as the wait between seasons can be long (3 years) it can 
  be helpful as a refresher on characters names and personality as gathered through most said words, relationships, and when they are the most active.
</p>
<h2>Data:</h2>
<p>
  For the data, we searched and found the best script possible and imported it using a webscraper. We then manipulated the data in a pandas dataframe with columns of Season,Episode Number,Episode Title,Character,Dialogue,Timestamp, and TalkingTo.
  Most of this was easily gettable from the website, but TalkingTo was less noted so we created parameters to determine who was the most recent person that speaks after or before to try to take the best guess at who is in the conversation. We also created 2 other files
  for data that are used differently to lessen the processing needed to be done at runtime for the word cloud that counts the number of times each word was said, then another file to count how many times a word was said by each character. This drastically cut down the loading time for this section.<br>
 Link to data folder: https://github.com/heathnate/TV-time/tree/main/data
</p>
<h2>Visualization Components:</h2>
<h3>Episode Word Count (Top Left)</h3>
<p>The heat map feature in the top left is meant to portray the frequency (per episode) at which characters are speaking. The shade of blue displayed is for easy comprehension of which characters are taking the bulk of the speaking roles in comparison to one another. One can filter the heat map with a season selector dropdown in the top left. This will update the graph to show data from Season 1, Season 2, or both. Filtering is also available through a character selection button which allows for handpicking characters to compare word frequency to one another. There are also two tooltips within this visualization. The first one displays the specific character, the selected season and episode number, and the word count for that corresponding character/episode combination. The second tooltip appears when hovering over a character on the y-axis, and shows the character name, total words spoken throughout the show, and total episodes appeared in throughout the show.</p>
<h3>Chord Diagram (Top Right)</h3>
<p>The Chord Diagram is designed to show how much each character talks to other specific characters. when deciding between an arc diagram and a chord diagram I realized that an arc diagram only showed who talks to who, while a chord diagram offers insights on how much each character talks to others. The way to read it is that the bigger the connecting part the more those characters talked together. This also allows you to see who talked the most as the outer arc represents the total amount they talked throughout the show. Since I needed to differentiate 10 different characters I choose a rainbow color scheme as it did the best at making that many distinct colors. If you want to narrow the focus there is a selection in the top right that works the same as the heatmap, choose a season and it will update to only show that seasons data, or you can choose to have data from all the seasons.</p>
<h3>Word Cloud (Bottom Left)</h3>
<p>
  The word cloud is an interesting view, as it can be used to glean the most common words by a character and thus determine somewhat what type of person they are. The words are sized based on the number of times that word is said, and there are two filters included:
  The filter for the word "you" and the filter by character. The filter for "you" was a decision we came to because of how frequently the word is said, most common words such as it or the are filtered out, but I thought it meaningful to include this because of its importance
  to the theme of the show, but with it included it is nearly impossible to tell what the next common word is because of how this breaks the scale. So to solve that I allowed the filter to then get both sides of it. For the character filter this allows you to narrow on common
  words by each character and this can be interesting with major or minor characters to find common dialogue.
</p>
<h3>Undecided - EDIT ME (Bottom Right)</h3>
<p>FILLER</p>
<h2>What We Can Discover:</h2>
<h2>Libraries Used / Code Structure / Access:</h2>
<h2>Video Demo:</h2>
<h2>Work Breakdown:</h2>
<p>Eli Pappas - Data Import, Processing, and Cleaning, and Word Cloud<br>
Nate Heath - UI Design and Creation, Info Dialog, and Heatmap
Nick Bryant - Chord Diagram creation</p>
