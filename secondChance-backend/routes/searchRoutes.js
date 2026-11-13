const express = require('express')
const router = express.Router()
const connectToDatabase = require('../models/db')

// Search for gifts
router.get('/', async (req, res, next) => {
  try {
    // Task 1: Connect to MongoDB using connectToDatabase database. Remember to use the await keyword and store the connection in `db`
    const db = await connectToDatabase()
    const collection = db.collection(`${process.env.MONGO_COLLECTION}`)

    // Add the name filter to the query if the name parameter is not empty
    // Task 2: Check if the name exists and is not empty
    let qryName = {}
    if (req.query.name && req.query.name.trim() !== '') {
      qryName = { name: { $regex: req.query.name, $options: 'i' } } // Using regex for partial match, case-insensitive
    }

    // Task 3: Add other filters to the query
    // Task 3: Add the remaining three filters to the query: category, condition, age_years
    const qryCategory = req.query.category ? { category: req.query.category } : {}
    const qryCondition = req.query.condition ? { condition: req.query.condition } : {}
    const qryAgeYears = req.query.age_years ? { age_years: { $lte: parseInt(req.query.age_years) } } : {}

    // Task 4: Fetch filtered gifts using the find(query) method. Make sure to use await and store the result in the `items` constant
    const items = await collection.find({ ...qryName, ...qryCategory, ...qryCondition, ...qryAgeYears }).toArray()

    res.json(items)
  } catch (e) {
    next(e)
  }
})

module.exports = router
