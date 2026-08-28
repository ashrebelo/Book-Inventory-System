require('dotenv').config();
const express = require('express');


const app = express();
const port = process.env.PORT || 3000;

const books = [
  {
    serial: "BK-001",
    tags: ["fiction", "mystery"],
    publishingCompany: "Penguin Random House",
    inventoryCount: 25,
    unitsSold: 18
  },
  {
    serial: "BK-002",
    tags: ["science-fiction", "fantasy"],
    publishingCompany: "HarperCollins",
    inventoryCount: 40,
    unitsSold: 32
  },
  {
    serial: "BK-003",
    tags: ["romance", "fiction"],
    publishingCompany: "Simon & Schuster",
    inventoryCount: 30,
    unitsSold: 21
  },
  {
    serial: "BK-004",
    tags: ["history", "non-fiction"],
    publishingCompany: "Macmillan Publishers",
    inventoryCount: 15,
    unitsSold: 9
  },
  {
    serial: "BK-005",
    tags: ["biography", "non-fiction"],
    publishingCompany: "Hachette Book Group",
    inventoryCount: 20,
    unitsSold: 14
  }
];

console.log(books);

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