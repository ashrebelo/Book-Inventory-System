const mongoose = require("mongoose");

const bookSchema = new mongoose.Schema({
    serial: {
        type: String,
        required: true
    },
    tags: {
        type: [String],
        required: true,
        default: undefined
    },
    publishingCompany: {
        type: String,
        required: true
    }, 
    inventory: {
        type: Number,
        required: true
    }, 
    unitsSold: {
        type: Number,
        required: true
    }
});

const Book = mongoose.model("Book", bookSchema);

module.exports = Book;