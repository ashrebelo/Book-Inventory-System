const express = require('express');
const request = require('supertest');
const sinon = require('sinon');
const mongoose = require('mongoose');
const { expect } = require('chai');

const Book = require('../models/book');
const bookController = require('../controllers/bookController');
const booksRouteEntry = require.resolve('../routes/booksRoute');

const realGetBookById = bookController.getBookById;
const realCreateBook = bookController.createBook;


function mockHandler(name) {
    const fn = (req, res) => {
        fn.calls.push(req);
        res.status(200).json({ handler: name });
    };
    fn.calls = [];
    return fn;
}

function loadRouterWithCurrentHandlers() {
    delete require.cache[booksRouteEntry];
    return require('../routes/booksRoute');
}

function buildAppAround(router) {
    const app = express();
    app.use(express.json());
    app.use('/', router);
    return app;
}

function useRealControllerAndBuildApp() {
    bookController.getBookById = realGetBookById;
    bookController.createBook = realCreateBook;
    return buildAppAround(loadRouterWithCurrentHandlers());
}

function storedBook(id) {
    return {
        _id: id,
        serial: 'SN-001',
        tags: ['fiction'],
        publishingCompany: 'Acme Publishing',
        inventory: 5,
        unitsSold: 2
    };
}

function newBookBody() {
    const body = storedBook(undefined);
    delete body._id;
    return body;
}

function stubSaveSoRealSchemaRulesStillApply() {
    return sinon.stub(Book.prototype, 'save').callsFake(function () {
        const schemaFailure = this.validateSync();
        if (schemaFailure) {
            return Promise.reject(schemaFailure);
        }
        return Promise.resolve(this);
    });
}

describe('booksRoute wiring (controller mocked)', () => {
    let app;
    let getByIdMock;
    let createMock;

    beforeEach(() => {
        getByIdMock = mockHandler('getBookById');
        createMock = mockHandler('createBook');

        bookController.getBookById = getByIdMock;
        bookController.createBook = createMock;

        app = buildAppAround(loadRouterWithCurrentHandlers());
    });

    afterEach(() => {
        bookController.getBookById = realGetBookById;
        bookController.createBook = realCreateBook;
    });

    it('GET /books/:id reaches getBookById, not createBook', async () => {
        const res = await request(app).get('/books/abc123');

        expect(getByIdMock.calls).to.have.lengthOf(1);
        expect(createMock.calls).to.have.lengthOf(0);
        expect(res.body).to.deep.equal({ handler: 'getBookById' });
    });

    it('GET /books/:id passes the id through unchanged', async () => {
        await request(app).get('/books/some-id-value');

        expect(getByIdMock.calls[0].params.id).to.equal('some-id-value');
    });

    it('GET /books/:id decodes a url encoded id', async () => {
        await request(app).get('/books/two%20words');

        expect(getByIdMock.calls[0].params.id).to.equal('two words');
    });

    it('POST /books reaches createBook, not getBookById', async () => {
        const res = await request(app).post('/books').send({ serial: 'X' });

        expect(createMock.calls).to.have.lengthOf(1);
        expect(getByIdMock.calls).to.have.lengthOf(0);
        expect(res.body).to.deep.equal({ handler: 'createBook' });
    });

    it('POST /books passes the parsed json body through unchanged', async () => {
        const payload = { serial: 'SN-042', tags: ['a', 'b'] };

        await request(app).post('/books').send(payload);

        expect(createMock.calls[0].body).to.deep.equal(payload);
    });
});

describe('booksRoute defines only two routes', () => {
    let app;

    beforeEach(() => {
        app = useRealControllerAndBuildApp();
    });

    afterEach(() => {
        sinon.restore();
    });

    const requestsTheRouterDoesNotDefine = [
        { method: 'get', path: '/books' },
        { method: 'put', path: '/books/abc123' },
        { method: 'delete', path: '/books/abc123' },
        { method: 'patch', path: '/books/abc123' },
        { method: 'post', path: '/books/abc123' },
        { method: 'get', path: '/' },
        { method: 'get', path: '/authors/abc123' }
    ];

    requestsTheRouterDoesNotDefine.forEach(({ method, path }) => {
        it(`${method.toUpperCase()} ${path} matches nothing, 404`, async () => {
            const res = await request(app)[method](path);

            expect(res.status).to.equal(404);
        });
    });

    it('GET /Books/:id still matches, express ignores case', async () => {
        sinon.stub(Book, 'findById').resolves(null);

        const res = await request(app).get('/Books/abc123');

        expect(res.status).to.equal(404);
        expect(res.body.message).to.equal('book not found');
    });
});

describe('GET /books/:id', () => {
    let app;

    beforeEach(() => {
        app = useRealControllerAndBuildApp();
    });

    afterEach(() => {
        sinon.restore();
    });

    it('id matches: 200, whole book returned', async () => {
        const id = new mongoose.Types.ObjectId().toString();
        const stored = storedBook(id);
        sinon.stub(Book, 'findById').resolves(stored);

        const res = await request(app).get(`/books/${id}`);

        expect(res.status).to.equal(200);
        expect(res.body).to.deep.equal(stored);
    });

    it('id from url is what findById is called with', async () => {
        const id = new mongoose.Types.ObjectId().toString();
        const findById = sinon.stub(Book, 'findById').resolves(storedBook(id));

        await request(app).get(`/books/${id}`);

        expect(findById.calledOnceWith(id)).to.equal(true);
    });

    it('id valid but no match: 404, "book not found"', async () => {
        const id = new mongoose.Types.ObjectId().toString();
        sinon.stub(Book, 'findById').resolves(null);

        const res = await request(app).get(`/books/${id}`);

        expect(res.status).to.equal(404);
        expect(res.body.message).to.equal('book not found');
    });

    it('id malformed: 400, "Invalid book id"', async () => {
        sinon.stub(Book, 'findById').rejects(new mongoose.Error.CastError('ObjectId', 'not-a-real-id', '_id'));

        const res = await request(app).get('/books/not-a-real-id');

        expect(res.status).to.equal(400);
        expect(res.body.message).to.equal('Invalid book id');
    });

    it('id 500 chars long: 400, "Invalid book id"', async () => {
        const overlongId = 'x'.repeat(500);
        sinon.stub(Book, 'findById').rejects(new mongoose.Error.CastError('ObjectId', overlongId, '_id'));

        const res = await request(app).get(`/books/${overlongId}`);

        expect(res.status).to.equal(400);
        expect(res.body.message).to.equal('Invalid book id');
    });

    it('database down, id fine: 500, "Could not fetch book"', async () => {
        sinon.stub(Book, 'findById').rejects(new Error('connection timed out'));

        const res = await request(app).get(`/books/${new mongoose.Types.ObjectId()}`);

        expect(res.status).to.equal(500);
        expect(res.body.message).to.equal('Could not fetch book');
    });
});

describe('POST /books', () => {
    let app;

    beforeEach(() => {
        app = useRealControllerAndBuildApp();
    });

    afterEach(() => {
        sinon.restore();
    });

    it('complete book: saved record returned with generated id', async () => {
        stubSaveSoRealSchemaRulesStillApply();

        const res = await request(app).post('/books').send(newBookBody());

        expect(res.body.serial).to.equal('SN-001');
        expect(res.body.publishingCompany).to.equal('Acme Publishing');
        expect(res.body._id).to.be.a('string');
    });

    it('posted body is what the model is built from', async () => {
        const save = stubSaveSoRealSchemaRulesStillApply();

        await request(app).post('/books').send(newBookBody());

        expect(save.thisValues[0].serial).to.equal('SN-001');
        expect(save.thisValues[0].publishingCompany).to.equal('Acme Publishing');
    });

    ['serial', 'publishingCompany', 'inventory', 'unitsSold'].forEach((requiredField) => {
        it(`${requiredField} missing: 400, "Could not add book"`, async () => {
            stubSaveSoRealSchemaRulesStillApply();
            const body = newBookBody();
            delete body[requiredField];

            const res = await request(app).post('/books').send(body);

            expect(res.status).to.equal(400);
            expect(res.body.message).to.equal('Could not add book');
        });
    });

    it('tags omitted, defaults to []: 400, "Could not add book"', async () => {
        stubSaveSoRealSchemaRulesStillApply();
        const body = newBookBody();
        delete body.tags;

        const res = await request(app).post('/books').send(body);

        expect(res.status).to.equal(400);
        expect(res.body.message).to.equal('Could not add book');
    });

    it('tags sent empty: 400, "Could not add book"', async () => {
        stubSaveSoRealSchemaRulesStillApply();
        const body = newBookBody();
        body.tags = [];

        const res = await request(app).post('/books').send(body);

        expect(res.status).to.equal(400);
        expect(res.body.message).to.equal('Could not add book');
    });

    it('empty json body: 400, "Could not add book"', async () => {
        stubSaveSoRealSchemaRulesStillApply();

        const res = await request(app).post('/books').send({});

        expect(res.status).to.equal(400);
        expect(res.body.message).to.equal('Could not add book');
    });

    it('no body at all: 400, "Could not add book"', async () => {
        stubSaveSoRealSchemaRulesStillApply();

        const res = await request(app).post('/books');

        expect(res.status).to.equal(400);
        expect(res.body.message).to.equal('Could not add book');
    });

    it('inventory not numeric: 400, "Could not add book"', async () => {
        stubSaveSoRealSchemaRulesStillApply();
        const body = newBookBody();
        body.inventory = 'not a number';

        const res = await request(app).post('/books').send(body);

        expect(res.status).to.equal(400);
        expect(res.body.message).to.equal('Could not add book');
    });

    it('inventory "7": cast to number 7 and saved', async () => {
        const save = stubSaveSoRealSchemaRulesStillApply();
        const body = newBookBody();
        body.inventory = '7';

        const res = await request(app).post('/books').send(body);

        expect(save.thisValues[0].inventory).to.equal(7);
        expect(res.body.inventory).to.equal(7);
    });

    it('field not in schema: dropped, never saved or returned', async () => {
        const save = stubSaveSoRealSchemaRulesStillApply();
        const body = newBookBody();
        body.smuggledField = 'should not be saved';

        const res = await request(app).post('/books').send(body);

        expect(save.thisValues[0].smuggledField).to.equal(undefined);
        expect(res.body.smuggledField).to.equal(undefined);
    });

    it('book valid, database down: 500, "Could not add book"', async () => {
        sinon.stub(Book.prototype, 'save').rejects(new Error('connection timed out'));

        const res = await request(app).post('/books').send(newBookBody());

        expect(res.status).to.equal(500);
        expect(res.body.message).to.equal('Could not add book');
    });

    it('malformed json: 400 from parser, save never attempted', async () => {
        const save = stubSaveSoRealSchemaRulesStillApply();

        const res = await request(app)
            .post('/books')
            .set('Content-Type', 'application/json')
            .send('{"serial": ');

        expect(res.status).to.equal(400);
        expect(save.called).to.equal(false);
    });
});
