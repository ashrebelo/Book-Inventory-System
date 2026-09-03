require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose')
const booksRoute = require('./routes/booksRoute');

const app = express();
const port = process.env.PORT || 3000;


app.use(express.json()); 

=======
app.use('/', booksRoute);

function listRoutes() {
  const stack = (app.router || app._router).stack;                     
  return stack
    .filter((layer) => layer.route)                                   
    .flatMap((layer) => Object.keys(layer.route.methods)                
      .filter((method) => layer.route.methods[method])                  
      .map((method) => `${method.toUpperCase()} ${layer.route.path}`)); 
}


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


app.post("/books", async (req, res) => {
    try {
        const newBook = new Book(req.body); //come back to this incase they have dif name for the model
        const savedBook = await newBook.save();
        res.json(savedBook);
    } catch (error) {
        res.json({ message: "Could not add book" });
    }
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
  res.status(404).json({                                         
    error: 'Route not found',                                     
    message: `No route matches ${req.method} ${req.originalUrl}`,
    method: req.method,                                          
    path: req.originalUrl,                                        
    availableRoutes: listRoutes()                                 
  });
});



app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});