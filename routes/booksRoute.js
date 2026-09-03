const express = require('express');
const router = express.Router();
const Book = require('../models/book')

const bookController = require('../controllers/bookController')

router.get('/books/:id', bookController.getBookById);
router.post('/books', bookController.createBook);
router.get("/books",bookController.getAllBooks); //Task A updated, getting all books - Sep-03 Ivan R.

module.exports = router;