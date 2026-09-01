const express = require('express');
const router = express.Router();
const Book = require('../models/book')

const bookController = require('../controllers/bookController')

router.get('/books/:id', bookController.getBookById);