require('dotenv').config();
const express = require('express');


const app = express();
const port = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.send('Hello');
});

app.get("/books/:id", (req, res) => {
    const id = Number(req.params.id);

    const book = books.find(book => book.id === id);

    if (!book) {
        return res.status(404).json({
            message: "Book not found"
        });
    }

    res.json(book);
});


app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});