require('dotenv').config();
const express = require('express');


const app = express();
const port = process.env.PORT || 3000;


app.use(express.json()); 


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



app.post("/books", async (req, res) => {
    try {
        const newBook = new Book(req.body); //come back to this incase they have dif name for the model
        const savedBook = await newBook.save();
        res.json(savedBook);
    } catch (error) {
        res.json({ message: "Could not add book" });
    }
});




app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});