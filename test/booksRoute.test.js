const express = require('express');
const request = require('supertest');
const { expect } = require('chai'); // pin chai@4 -- chai 5+ is ESM-only, require() breaks

const bookController = require('../controllers/bookController');
const booksRouteEntry = require.resolve('../routes/booksRoute');


function mockHandler(name) {
    const fn = (req, res) => {
        fn.calls.push(req);
        res.status(200).json({ handler: name });
    };
    fn.calls = [];
    return fn;
}

describe('booksRoute.js', () => {
    let app;
    let getByIdMock;
    let createMock;

    beforeEach(() => {
        getByIdMock = mockHandler('getBookById');
        createMock = mockHandler('createBook');

        bookController.getBookById = getByIdMock;
        bookController.createBook = createMock;

        delete require.cache[booksRouteEntry];
        const booksRoute = require('../routes/booksRoute');

        app = express();
        app.use(express.json());
        app.use('/', booksRoute);
    });

    describe('GET /books/:id', () => {
        it('routes to bookController.getBookById', async () => {
            const res = await request(app).get('/books/abc123');

            expect(getByIdMock.calls).to.have.lengthOf(1);
            expect(createMock.calls).to.have.lengthOf(0);
            expect(res.body).to.deep.equal({ handler: 'getBookById' });
        });

        it('passes the :id param through unchanged', async () => {
            await request(app).get('/books/some-id-value');

            expect(getByIdMock.calls[0].params.id).to.equal('some-id-value');
        });
    });

    describe('POST /books', () => {
        it('routes to bookController.createBook', async () => {
            const res = await request(app).post('/books').send({ serial: 'X' });

            expect(createMock.calls).to.have.lengthOf(1);
            expect(getByIdMock.calls).to.have.lengthOf(0);
            expect(res.body).to.deep.equal({ handler: 'createBook' });
        });

        it('passes the parsed request body through unchanged', async () => {
            const payload = { serial: 'SN-042', tags: ['a', 'b'] };
            await request(app).post('/books').send(payload);

            expect(createMock.calls[0].body).to.deep.equal(payload);
        });
    });
});
