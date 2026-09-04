const chai = require('chai');
const chaiHttp = require('chai-http');
const router = require('../routes/booksRoute');

const { expect } = chai;
chai.use(chaiHttp);

describe('Book Routes API', () => {

  describe('GET /books/:id', () => {
    it('should retrieve a book by its valid ID', async () => {
      // Replace with a realistic ID from your database setup
      const bookId = '60c72b2f9b1d8b2bad123456'; 
      
      const res = await chai.request(router).get(`/books/${bookId}`);
      
      expect(res).to.have.status(200);
      expect(res.body).to.be.an('object');
      expect(res.body).to.have.property('_id', bookId);
      expect(res.body).to.have.property('title');
    });

    it('should fail', async () => {
      // Replace with a realistic ID from your database setup
      const bookId = '60c72b2f9b1d8b2bad123456'; 
      
      const res = await chai.request(router).get(`/books/${bookId}`);
      
      expect(res).to.have.status(404);
    });
  });

  describe('POST /books', () => {
    it('should successfully create a new book item', async () => {
      const newBook = {
        title: 'The Great Gatsby',
        author: 'F. Scott Fitzgerald',
        stock: 12
      };

      const res = await chai.request(router)
        .post('/books')
        .send(newBook);

      expect(res).to.have.status(200);
      expect(res.body).to.be.an('object');
      expect(res.body.title).to.equal(newBook.title);
    });
    it('should fail', async () => {
      const newBook = {
        title: 'The Great Gatsby',
        author: 'F. Scott Fitzgerald',
        stock: 12
      };

      const res = await chai.request(router)
        .post('/books')
        .send(newBook);

      expect(res).to.have.status(404);
    });
  });

});
