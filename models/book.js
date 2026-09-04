const mongoose = require("mongoose");

const bookSchema = new mongoose.Schema({
    serial: {
        type: String,
        required: true
    },
    tags: {
        type: [String],
        required: true,
        validate: {
            // required alone cannot catch an empty tag list. Mongoose gives every array field a default of [], and required only rejects null or undefined, so a book sent with no tags would otherwise save with an empty list.
            validator: (tags) => tags.length > 0,
            message: "A book needs at least one tag"
        }
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