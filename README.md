<h1>Documentation:</h1>
<h2>Motivation:</h2>
<p></p>
<h2>Data:</h2>
<p>
  For the data, we searched and found the best script possible and imported it using a webscraper. We then manipulated the data in a pandas dataframe with columns of Season,Episode Number,Episode Title,Character,Dialogue,Timestamp, and TalkingTo.
  Most of this was easily gettable from the website, but TalkingTo was less noted so we created parameters to determine who was the most recent person that speaks after or before to try to take the best guess at who is in the conversation. We also created 2 other files
  for data that are used differently to lessen the processing needed to be done at runtime for the word cloud that counts the number of times each word was said, then another file to count how many times a word was said by each character. This drastically cut down the loading
  time for this section. Link to data folder: https://github.com/heathnate/TV-time/tree/main/data.
</p>
<h2>Visualization Components:</h2>
<h2>What We Can Discover:</h2>
<h2>Libraries Used / Code Structure / Acess:</h2>
<h2>Video Demo:</h2>
<h2>Work Breakdown:</h2>
<p>Eli Pappas - Data Import, Processing, and Cleaning, and Word Cloud</p>
