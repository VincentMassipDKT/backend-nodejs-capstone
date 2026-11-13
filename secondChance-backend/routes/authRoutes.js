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


router.post('/login', async (req, res) => {
    try {
        // Task 1: Connect to `secondChance` in MongoDB through `connectToDatabase` in `db.js`.
        const db = await connectToDatabase();
        // Task 2: Access MongoDB `users` collection
        const usersCollection = db.collection('users');
		// Task 3: Check for user credentials in database
        const { email } = req.body;
        const existingUser = await usersCollection.findOne({ email: email });
        if (existingUser) {
            // Task 4: Check if the password matches the encrypted password and send appropriate message on mismatch
            const isPasswordValid = await bcryptjs.compare(req.body.password, existingUser.password);
            if (!isPasswordValid) {
                return res.status(401).send('Invalid password');
            };
            // Task 5: Fetch user details from a database
            const userName = `${existingUser.firstName} ${existingUser.lastName}`;
            const userEmail = existingUser.email;
            // Task 6: Create JWT authentication if passwords match with user._id as payload
            const authtoken = jwt.sign({ user: { id: existingUser._id } }, process.env.JWT_SECRET, { expiresIn: '1h' });
            logger.info(`User logged in with email: ${userEmail}`);
            return res.status(200).json({
                userName: userName,
                userEmail: userEmail,
                token: authtoken
            });
        } else {
            // Task 7: Send appropriate message if the user is not found
            if (!existingUser) {
                return res.status(404).send('User not found');
            };
        }
    } catch (e) {
         return res.status(500).send('Internal server error');

    }
});


module.exports = router;