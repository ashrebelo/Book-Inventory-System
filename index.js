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

// GET /books - return every book from MongoDB
app.get("/books", async (req, res) => {
  try {
    const books = await Book.find({});
    res.status(200).json(books);
  } catch (err) {
    console.error("Error fetching books:", err);
    res.status(500).json({ error: "Failed to fetch books" });
  }
});

app.use((req, res) => {
  res.status(404).json({                                          // returns the 404 code as well as the following:
    error: 'Route not found',                                     // feedback that the route wasn't found
    message: `No route matches ${req.method} ${req.originalUrl}`, // a plain sentence repeating exactly what was asked for
    method: req.method,                                           // the action attempted
    path: req.originalUrl,                                        // the address typed, kept whole including anything after the ? mark
//    availableRoutes: listRoutes()                                 // ***Enable this if you turn on the function above*** List every address that does work and is enabled at the time of the call
  });
});

app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});