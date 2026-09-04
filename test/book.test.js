const {expect} = require('chai');
const Book = require('../models/book');

describe('Book Model Testing', () => {

    it ("should create a valid book", () => {
        const book = new Book({
            serial: "ABC123",
            tags: ["fraction", "novel"],
            publishingCompany: "penguin",
            inventory: 10,
            unitsSold: 3
        });

        expect(book.serial).to.equal("ABC123");
        expect(book.tags).to.deep.equal(["fraction", "novel"]);
        expect(book.publishingCompany).to.equal("penguin");
        expect(book.inventory).to.equal(10);
        expect(book.unitsSold).to.equal(3);
    }); 

    it ("should require serial", () => {
        const book = new Book({
            tags: ["fraction"],
            publishingCompany: "lion",
            inventory: 9,
            unitsSold: 1
        });

        const error = book.validateSync();

        expect(error.errors.serial).to.exist;
    });

    it ("should require tags", () => {
        const book = new Book({
            serial: "ABC123",
            publishingCompany: "lion",
            inventory: 9,
            unitsSold: 1
        });

        const error = book.validateSync();

        expect(error.errors.tags).to.exist;
    });

    it ("should require inventory", () => {
        const book = new Book({
            serial: "ABC123",
            tags: ["fraction"],
            publishingCompany: "lion",
            unitsSold: 1
        });

        const error = book.validateSync();

        expect(error.errors.inventory).to.exist;
    });

    it ("should require publishingCompany", () => {
        const book = new Book({
            serial: "ABC123",
            tags: ["fraction"],
            inventory: 10,
            unitsSold: 1
        });

        const error = book.validateSync();

        expect(error.errors.publishingCompany).to.exist;
    });

    it ("should require unitsSold", () => {
        const book = new Book({
            serial: "ABC123",
            tags: ["fraction"],
            publishingCompany: "lion",
            inventory: 10
        });

        const error = book.validateSync();

        expect(error.errors.unitsSold).to.exist;
    });
})