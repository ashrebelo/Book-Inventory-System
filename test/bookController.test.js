const {expect} = require('chai');
const bookController = require('../controllers/bookController');

describe('Book controller validation', () => {
    // testing the getBookById
    it('if there was no book found', () => {
        const getBookById = bookController.getBookById('example id that does not exist');
        expect(getBookById).to.have.status(404);
    })
    it('if there was a book found', () => {
        const getBookById = bookController.getBookById('example id that exists');
        expect(getBookById).to.have.status(200);
    })
    it('if the id is not correct', () => {
        const getBookById = bookController.getBookById('example not correct id');
        expect(getBookById).to.have.status(400);
    })
    // this for the createBook
    it('create book successfully', () => {
        const body = {
            serial: 'ABC123',
            tags: ['fiction'],
            inventory: 10,
            unitsSold: 2
        }
        const createBook = bookController.createBook(body);
        expect(createBook).to.have.status(200);
    })
    it('create book was not successfull', () => {
        const body = {
            // serial: 'ABC123',
            tags: ['fiction'],
            inventory: 10,
            unitsSold: 2
        }
        const createBook = bookController.createBook(body);
        expect(createBook).to.have.status(400);
    })
    
    // testing getAllBooks
    it('getting all the books successfully', () => {
        const getAllBooks = bookController.getAllBooks();
        expect(getAllBooks).to.have.status(200);

    })
    it('getting all the books is not successful', () => {
        const getAllBooks = bookController.getAllBooks();
        expect(getAllBooks).to.have.status(500);

    })

})