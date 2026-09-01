const express = require('express');
const router = express.Router();
const book = require('../models/book');

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
        // invalid mongodb _id
        res.status(400).json({
            message: "Invalid book id"
        });
    }
};


module.exports = {getBookById}