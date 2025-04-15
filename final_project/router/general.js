const express = require('express');
const fs = require('fs');
const fastCsv = require("fast-csv");
const csvParser = require('csv-parser');
let {isValid} = require("./auth_users.js");
let { addNewUserIntoCSV, loadUsersFromCSV } = require("./auth_users.js");
let {users} = require("./auth_users.js");
const axios = require('axios');
const bodyParser = require('body-parser');

const public_users = express.Router();

let books = [];

// Middleware to parse incoming JSON requests
public_users.use(bodyParser.json());

// Load books from CSV file into memory
function loadBooksFromCSV() {
    return new Promise((resolve, reject) => {
        const bookArray = [];
        fs.createReadStream('./router/books.csv')
            .pipe(csvParser())
            .on('data', (row) => {
              bookArray.push(row);
            })
            .on('end', () => {
                console.log('Books from CSV file successfully processed');
                books = bookArray;
                resolve(bookArray);
            })
            .on('error', (err) => {
                reject(err);
            });
    });
}


// Update book review into CSV file
async function UpdateBooksReviewIntoCSV (update_bookReview, isbn) {
    try {
        // Find the index of the book with the given ISBN
        let book_ind = books.findIndex(book => book.isbn === String(isbn));

        // Check if the book exists
        if (book_ind === -1) {
            throw new Error(`Book with ISBN ${isbn} not found.`);
        }

        // Update the reviews property
        books[book_ind].reviews = update_bookReview;
        await new Promise((resolve, reject) => {
            const writeStream = fs.createWriteStream("./router/books.csv");
            fastCsv
                .write(books, { headers: true })
                .pipe(writeStream)
                .on('finish', resolve)
                .on('error', reject);
        });

        console.log('Books from CSV file updated successfully!');
    } catch (error) {
        console.error('Error updating books from CSV file:', error);
    }
}


public_users.post("/register", async (req, res) => {
    const registerUserName = req.body.username;
    const registerPassword = req.body.password;
  
    if (!registerUserName || !registerPassword) {
      return res.status(404).json({ message: "Missing Input" });
    }
  
    if (isValid(registerUserName)) {
      new_user = { "username": registerUserName, "password": registerPassword, "isAdmin": false }
      
      await addNewUserIntoCSV(new_user);

       // Reload the users array from the CSV file
       const userArray = await loadUsersFromCSV();
       users.length = 0; // Clear the existing users array
       users.push(...userArray); // Update the users array with the latest data
       console.log(users);

      return res.status(200).json({ message: "User successfully registered. Now you can login" });
    } else {
      return res.status(404).json({ message: "User already exists!" });
    }
  });

// Get the book list available in the shop
public_users.get('/', async function (req, res) {
    try {
      res.status(200).json(books);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  });
  
  // Get book details based on ISBN using Promise
  public_users.get('/isbn/:isbn', function (req, res) {
    const isbn = req.params.isbn;
    
    // Return a promise to fetch book details
    const getBookDetails = new Promise((resolve, reject) => {
      if (books[isbn - 1]) {
        resolve(books[isbn - 1]);
      } else {
        reject(new Error("Book not found"));
      }
    });
  
    getBookDetails
      .then(bookDetails => {
        return res.status(200).json(bookDetails);
      })
      .catch(err => {
        return res.status(404).json({ message: err.message });
      });
  });
  
  // Get book details based on author
  public_users.get('/author/:author', async function (req, res) {
    try {
      const authorName = req.params.author;
      const foundBooks = Object.values(books).find(book => book.author === authorName);
  
      if (foundBooks) { // foundBooks.length > 0
        return res.status(200).json(foundBooks);
      } else {
        return res.status(404).json({ message: "No books found for this author." });
      }
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  });
  
  // Get all books based on title
  public_users.get('/title/:title', async function (req, res) {
    try {
      const title = req.params.title;
      const foundBooks = Object.values(books).find(book => book.title === title);
  
      if (foundBooks) {
        return res.status(200).json(foundBooks);
      } else {
        return res.status(404).json({ message: "No books found with this title." });
      }
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  });

//  Get book review
public_users.get('/reviews/:isbn', function (req, res) {
  const isbn = req.params.isbn;

  if (!books || books.length === 0) {
      return res.status(500).json({ message: "Books data is not loaded." });
  }

  const book = books.find(book => book.isbn === isbn);
  if (book) {
      return res.status(200).json({ message: `The reviews of the book are: ${book.reviews}` });
  } else {
      return res.status(404).json({ message: "Book not found." });
  }
});

module.exports.general = public_users;
module.exports.books = books;
module.exports.loadBooksFromCSV = loadBooksFromCSV;
module.exports.UpdateBooksReviewIntoCSV = UpdateBooksReviewIntoCSV;