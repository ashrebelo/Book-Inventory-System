const express = require('express');
const router = express.Router();
const book = require('../models/book');

const getBookById =  async (req, res) => {
    try {
        const book = await book.findById(req.params.id);

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

const createBook = async (req, res) => {
    try {
        const newBook = new book(req.body);
        const savedBook = await newBook.save();
        res.status(200).json(savedBook);
    } catch (error) {
        res.status(400).json({ message: "Could not add book" });
    }
};


//Task A: Getting all books - Sep-03 (Ivan R.):
const getAllBooks = async (req,res)=>{
    try{
        const books = await Book.find({});
        res.status(200).json(books);
    }catch(error){
        res.status(500).json({message:"Could not fetch books. Please try again"})
    }
};


module.exports = {getBookById, createBook,getAllBooks};