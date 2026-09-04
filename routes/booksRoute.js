const express = require('express');
const router = express.Router();
const Book = require('../models/book')

const bookController = require('../controllers/bookController')

// Return Book Using ID
router.get('/books/:id', bookController.getBookById);
//Create a books
router.post('/books', bookController.createBook);

module.exports = router;