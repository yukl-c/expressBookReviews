const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();
const axios = require('axios'); 


public_users.post("/register", (req, res) => {
    const registerUserName = req.body.username;
    const registerPassword = req.body.password;
  
    if (!registerUserName || !registerPassword) {
      return res.status(404).json({ message: "Missing Input" });
    }
  
    if (isValid(registerUserName)) {
      users.push({ "username": registerUserName, "password": registerPassword });
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
      if (books[isbn]) {
        resolve(books[isbn]);
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
      const foundBooks = Object.values(books).filter(book => book.author === authorName);
  
      if (foundBooks.length > 0) {
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
      const foundBooks = Object.values(books).filter(book => book.title === title);
  
      if (foundBooks.length > 0) {
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
public_users.get('/reviews/:isbn',function (req, res) {
  //Write your code here
  try {
    return res.status(200).json({message: books[req.params.isbn].reviews});
  } catch(err) {
    return res.status(404).json({message: err});
  }
});

module.exports.general = public_users;
