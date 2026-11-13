require('dotenv').config()
const express = require('express')
const axios = require('axios')
const logger = require('./logger')
const expressPino = require('express-pino-logger')({ logger })
// Task 1: import the natural library
const natural = require('natural')

// Task 2: initialize the express server
const app = express()
const port = process.env.PORT || 3000

app.use(express.json())
app.use(expressPino)

// Define the sentiment analysis route
// Task 3: create the POST /sentiment analysis
app.post('/sentiment', async (req, res) => {
  // Task 4: extract the sentence parameter
  //Use the query object of the request to obtain the sentence. The req.query object contains a set of key-value pairs representing the query parameters of the URL. The req.query code will get the query object. Use the destructuring assignment to get the value directly.
  const { sentence } = req.query
  if (!sentence) {
    logger.error('No sentence provided')
    return res.status(400).json({ error: 'No sentence provided' })
  }

  // Initialize the sentiment analyzer with the Natural's PorterStemmer and "English" language
  const Analyzer = natural.SentimentAnalyzer
  const stemmer = natural.PorterStemmer
  const analyzer = new Analyzer("English", stemmer, "afinn")

  // Perform sentiment analysis
  try {
    const analysisResult = analyzer.getSentiment(sentence.split(' '))

    // Task 5: set sentiment to negative or positive based on score rules
    // Task 5: Process the response from Natural by adding a sentiment of 'positive', 'negative' or 'neutral' based on the scores returned
    // If the score is < 0, the sentiment should be negative
    // If the score is between 0 and 0.33, it should be neutral
    // Otherwise, the sentiment should be positive
    let sentiment = "neutral"

    if (analysisResult < 0) {
        sentiment = "negative"
    } else if (analysisResult > 0.33) {
        sentiment = "positive"
    }

    // Logging the result
    logger.info(`Sentiment analysis result: ${analysisResult}`)

    // Task 6: send a status code of 200 with both sentiment score and the sentiment txt in the format { sentimentScore: analysisResult, sentiment: sentiment }
    return res.status(200).json({ sentimentScore: analysisResult, sentiment: sentiment })

  } catch (error) {
    logger.error(`Error performing sentiment analysis: ${error}`)
    // Task 7: if there is an error, return a HTTP code of 500 and the json {'message': 'Error performing sentiment analysis'}
    return res.status(500).json({ message: 'Error performing sentiment analysis' })
  }
})

app.listen(port, () => {
  logger.info(`Server running on port ${port}`)
})
