const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const router = express.Router();
const connectToDatabase = require('../models/db');
const logger = require('../logger');

// Define the upload directory path
const directoryPath = 'public/images';

// Set up storage for uploaded files
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, directoryPath); // Specify the upload directory
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname); // Use the original file name
  },
});

const upload = multer({ storage: storage });


// Get all secondChanceItems
router.get('/', async (req, res, next) => {
    logger.info('/ called');
    try {
        //Step 2: task 1 - insert code here
        const db = await connectToDatabase();
        //Step 2: task 2 - insert code here
        const collection = db.collection(`${process.env.MONGO_COLLECTION}`);
        //Step 2: task 3 - insert code here
        const secondChanceItems = await collection.find({}).toArray();
        //Step 2: task 4 - insert code here
        res.status(200).json(secondChanceItems);
    } catch (e) {
        logger.console.error('oops something went wrong', e)
        next(e);
    }
});

// Add a new item
router.post('/', upload.single('file'), async(req, res,next) => {
    try {
        //Step 3: Task 1: Connect to MongoDB
        const db = await connectToDatabase();
        //Step 3: Task 2: Use the collection() method to retrieve the secondChanceItems collection
        const collection = db.collection(`${process.env.MONGO_COLLECTION}`);
        //Step 3: Task 3: Create a new secondChanceItem from the request body
        const secondChanceItem = req.body;
        //Step 3: Task 4: Get the last id, increment it by 1, and set it to the new secondChanceItem
        const lastSecondChanceItem = await collection.find({}).sort({ id: -1 }).limit(1).toArray();
        secondChanceItem.id = lastSecondChanceItem.length > 0 ? lastSecondChanceItem[0].id + 1 : 1;
        //Step 3: Task 5: Set the current date to the new item
        const added_date = Math.floor(new Date().getTime() / 1000);
        secondChanceItem.added_date = added_date;
        //Step 3: Task 6: Add the secondChanceItem to the database
        const result = await collection.insertOne(secondChanceItem);
        //Step 3: Task 7: Upload the image to the images directory
        if (req.file) {
            const reqFilePath = req.file.path;
            const targetPath = path.join(directoryPath, req.file.originalname);
            fs.rename(reqFilePath, targetPath, err => {
                if (err) return next(err);
            });
        }

        res.status(201).json(result.ops[0]);
    } catch (e) {
        next(e);
    }
});

// Get a single secondChanceItem by ID
router.get('/:id', async (req, res, next) => {
    try {
        //Step 4: Task 1: Connect to MongoDB
        const db = await connectToDatabase();
        //Step 4: Task 2: Access the MongoDB collection
        const collection = db.collection(`${process.env.MONGO_COLLECTION}`);
        //Step 4: Task 3: Find a specific secondChanceItem by ID
        const secondChanceItem = collection.findOne({id: id});
        //Step 4: Task 4: Return the secondChanceItem as a JSON object. Return an error message if the item is not found.
        if (secondChanceItem) {
            res.status(200).json(secondChanceItem);
        } else {
            res.status(404).send(`Can't find any item with id [${id}]`);
        };
    } catch (e) {
        next(e);
    }
});

// Update and existing item
router.put('/:id', async(req, res,next) => {
    try {
        //Step 5: task 1 - insert code here
        //Step 5: task 2 - insert code here
        //Step 5: task 3 - insert code here
        //Step 5: task 4 - insert code here
        //Step 5: task 5 - insert code here
    } catch (e) {
        next(e);
    }
});

// Delete an existing item
router.delete('/:id', async(req, res,next) => {
    try {
        //Step 6: task 1 - insert code here
        //Step 6: task 2 - insert code here
        //Step 6: task 3 - insert code here
        //Step 6: task 4 - insert code here
    } catch (e) {
        next(e);
    }
});

module.exports = router;
