const express = require('express');
const router = express.Router();
const Book = require('../models/book');

const getBookById =  async (req, res) => {
    try {
        const book = await Book.findById(req.params.id);

        // if no book was found
        if(!book) {
            return res.status(404).json({
                message: "book not found"
            });
        }

        // return the book
        res.status(200).json(book);
    } catch (error){
        // a CastError means the id itself was the wrong shape, which is the caller's mistake
        if (error.name === 'CastError') {
            return res.status(400).json({
                message: "Invalid book id"
            });
        }

        // anything else went wrong on this end, so do not blame the caller for it
        res.status(500).json({
            message: "Could not fetch book"
        });
    }
};

const createBook = async (req, res) => {
    try {
        const newBook = new Book(req.body);
        const savedBook = await newBook.save();
        res.json(savedBook);
    } catch (error) {
        // a ValidationError means the book itself was incomplete or the wrong shape
        if (error.name === 'ValidationError') {
            return res.status(400).json({ message: "Could not add book" });
        }

        // otherwise the save failed on this end, so report it as a server problem
        res.status(500).json({ message: "Could not add book" });
    }
};




module.exports = {getBookById, createBook};