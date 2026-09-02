require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose')


const app = express();
const port = process.env.PORT || 3000;

mongoose.connect(process.env.MONGO_URI).then(() => console.log('Successfully connected to MongoDB')).catch(err => console.error('MongoDB initial connection error:', err));

app.get('/', (req, res) => {
    res.send('Hello');
});

app.get('/test-db', (req, res) => {
    // 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
    const state = mongoose.connection.readyState;
    
    if (state === 1) {
        return res.json({
            status: "success",
            message: "Database connected successfully!",
            databaseName: mongoose.connection.name
        });
    }

    const states = ["disconnected", "connected", "connecting", "disconnecting"];
    res.status(500).json({
        status: "error",
        message: "Database is not ready",
        currentState: states[state]
    });
});



const Book = mongoose.models.Book || mongoose.model('Book', new mongoose.Schema({
    serial: String,
    tags: [String],
    publishingCompany: String,
    inventoryCount: Number,
    unitsSold: Number
}));


app.get("/books/:id", async (req, res) => {
    try {
        const book = await Book.findById(req.params.id);

        if (!book) {
            return res.status(404).json({ message: "Book not found" });
        }

        res.json(book);
    } catch (error) {
        res.status(500).json({ message: "Invalid ID format or server error", error: error.message });
    }
});


app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});