const { expect } = require('chai'); // assertion style used to state what each result should be
const express = require('express'); // the web framework the router is designed to plug into
const request = require('supertest'); // sends fake HTTP requests straight at the app, no real server needed
const sinon = require('sinon'); // swaps the database calls for fakes so the tests never need MongoDB
const mongoose = require('mongoose'); // used only to build realistic looking MongoDB ids for the tests

const Book = require('../models/book'); // the model the controller reaches for, replaced by a stub in every test
const booksRoute = require('../routes/booksRoute'); // the router under test, holding the two book routes

// Build a throwaway Express app with only the books router mounted on it, so every test drives the real routing and controller code in memory without opening a port or connecting to a database.
function buildApp() {
    const app = express(); // a fresh app for each test so no state ever leaks between them
    app.use(express.json()); // turn a JSON request body into req.body, which POST /books depends on
    app.use('/', booksRoute); // mount at the root so the paths match the ones index.js serves
    return app; // hand the finished app back so supertest has something to send requests to
}

// Return the fields a client would send when adding a book, covering every field the schema marks as required.
function makeNewBook() {
    return {
        serial: 'SN-001', // the unique serial number the schema requires
        tags: ['fiction'], // the schema stores tags as a list of strings
        publishingCompany: 'Acme Publishing', // the company that published the book
        inventory: 5, // how many copies are currently in stock
        unitsSold: 2 // how many copies have been sold so far
    };
}

// Return a book shaped the way one already saved in the database would look, which is the same fields plus the id MongoDB assigned to it.
function makeStoredBook(id) {
    return { _id: id, ...makeNewBook() }; // a stored record is the posted fields with an id added
}

describe('booksRoute', () => {
    let app; // the test app, rebuilt before every single test

    beforeEach(() => {
        app = buildApp(); // start each test from a clean app with nothing stubbed yet
    });

    afterEach(() => {
        sinon.restore(); // put the real model methods back so one test can never affect another
    });

    describe('GET /books/:id', () => {
        it('responds with 200 and the book when the id matches a stored book', async () => {
            const id = new mongoose.Types.ObjectId().toString(); // a valid looking id to ask for
            const storedBook = makeStoredBook(id); // the record the database will pretend to hold
            sinon.stub(Book, 'findById').resolves(storedBook); // answer the lookup without a database

            const response = await request(app).get(`/books/${id}`); // drive the real route

            expect(response.status).to.equal(200); // a successful lookup should report success
            expect(response.body).to.deep.equal(storedBook); // and hand back the book unchanged
        });

        it('passes the id from the url through to the database lookup', async () => {
            const id = new mongoose.Types.ObjectId().toString(); // the id the url will carry
            const findById = sinon.stub(Book, 'findById').resolves(makeStoredBook(id)); // watch the lookup

            await request(app).get(`/books/${id}`); // send the request so the route runs

            expect(findById.calledOnceWith(id)).to.equal(true); // the url segment must reach the model
        });

        it('responds with 404 when no book has that id', async () => {
            const id = new mongoose.Types.ObjectId().toString(); // a well formed id that matches nothing
            sinon.stub(Book, 'findById').resolves(null); // mongoose gives back null when nothing matches

            const response = await request(app).get(`/books/${id}`); // ask for the missing book

            expect(response.status).to.equal(404); // a missing record is a not found, not a failure
            expect(response.body.message).to.equal('book not found'); // and says so in plain words
        });

        it('responds with 400 when the id is not a valid mongodb id', async () => {
            sinon.stub(Book, 'findById').rejects(new Error('Cast to ObjectId failed')); // what mongoose throws

            const response = await request(app).get('/books/not-a-real-id'); // send a malformed id

            expect(response.status).to.equal(400); // a bad id is the caller's mistake, not a server fault
            expect(response.body.message).to.equal('Invalid book id'); // and names which part was wrong
        });
    });

    describe('POST /books', () => {
        it('saves the posted book and returns the saved record', async () => {
            sinon.stub(Book.prototype, 'save').resolves(makeStoredBook('generated-id')); // fake the write

            const response = await request(app).post('/books').send(makeNewBook()); // post a new book

            expect(response.body.serial).to.equal('SN-001'); // the saved record comes back to the caller
            expect(response.body._id).to.equal('generated-id'); // including the id the database created
        });

        it('builds the new book from the posted request body', async () => {
            const save = sinon.stub(Book.prototype, 'save').resolves({}); // watch what is about to be saved

            await request(app).post('/books').send(makeNewBook()); // run the route for its saving side effect

            expect(save.thisValues[0].serial).to.equal('SN-001'); // the posted body must reach the model
            expect(save.thisValues[0].publishingCompany).to.equal('Acme Publishing'); // every field, not just one
        });

        // The controller answers a failed save with res.json and no status code, so this checks only the message. Asserting the 200 it currently sends would freeze what looks like an oversight into the test suite.
        it('reports a failure message when the book cannot be saved', async () => {
            sinon.stub(Book.prototype, 'save').rejects(new Error('validation failed')); // the save is refused

            const response = await request(app).post('/books').send({ serial: 'SN-002' }); // incomplete book

            expect(response.body.message).to.equal('Could not add book'); // the caller is told it failed
        });
    });
});
