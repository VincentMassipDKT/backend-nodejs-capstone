const express = require('express');
const router = express.Router();
const connectToDatabase = require('../models/db');
const logger = require('../logger');
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');


router.post('/register', async (req, res) => {
    try {
        // Task 1: Connect to `secondChance` in MongoDB through `connectToDatabase` in `db.js`.
        const db = await connectToDatabase();
        // Task 2: Access MongoDB `users` collection
        const usersCollection = db.collection('users');
		// Task 3: Check if user credentials already exists in the database and throw an error if they do
        const { email } = req.body;
        const existingUser = await usersCollection.findOne({ email: email });
        if (existingUser) {
            return res.status(400).send('User already exists');
        }
		// Task 4: Create a hash to encrypt the password so that it is not readable in the database
        const salt = await bcryptjs.genSalt(10);
        const hashedPassword = await bcryptjs.hash(req.body.password, salt);
        // Task 5: Insert the user into the database
        const result = await usersCollection.insertOne({
            email: email,
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            password: hashedPassword,
            createdAt: new Date(),
        });
		// Task 6: Create JWT authentication if passwords match with user._id as payload
        const token = jwt.sign({ user: { id: result.insertedId } }, process.env.JWT_SECRET, { expiresIn: '1h' });
		// Task 7: Log the successful registration using the logger
        logger.info(`User registered with email: ${email}`);
		// Task 8: Return the user email and the token as a JSON
        return res.status(201).json({
            email: email,
            token: token
        });
    } catch (e) {
         return res.status(500).send('Internal server error');
    }
});

module.exports = router;