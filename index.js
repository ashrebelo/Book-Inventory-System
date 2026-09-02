require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose')


const app = express();
const port = process.env.PORT || 3000;

// Enable this to provide feedback on what routes are available if a call 404s. You'll also have to enable the function call in the handler at the last line. 
// It's only meant to be helpful to our group, not intended for a real world deployment as it exposes all routes available.

// This builds a readable list of every address this app can answer. When express routes are created express stores them internally as a stack of layers. 
// This function searches that stack and the active routes, then turns each into a string and provides it to the route caller. This is only for our class project though, and is maybe not a good thing for all scenarios.

// function listRoutes() {
//   const stack = (app.router || app._router).stack;                      // Express 5 keeps routes on app.router, Express 4 used app._router
//   return stack
//     .filter((layer) => layer.route)                                     // drop helper functions, keep only entries that are genuine addresses
//     .flatMap((layer) => Object.keys(layer.route.methods)                // one address can allow several actions, so give each action its own line
//       .filter((method) => layer.route.methods[method])                  // an action counts only if it is switched on for that address
//       .map((method) => `${method.toUpperCase()} ${layer.route.path}`)); // combine action and address into one readable string
// }

//This is meant to catch when a user makes a call to a route that doesn't exist at the time of the call


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