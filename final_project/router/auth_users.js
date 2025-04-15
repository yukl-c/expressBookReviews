const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./general.js").books;
const csvParser = require('csv-parser');
const fs = require('fs');
const bodyParser = require('body-parser');
const { userInfo } = require('os');
const fastCsv = require("fast-csv");
const { loadBooksFromCSV, updateBooksReviewIntoCSV, addBookIntoCSV, isValidBook, removeBookIntoCSV } = require('./general.js');

const regd_users = express.Router();

let users = [];

// invalid token after logout
let blacklist = new Set();

// Middleware to parse incoming JSON requests
regd_users.use(bodyParser.json());

// check whether the user is admin or not
function inspectAdmin(req, res, next) {
    // Assuming `req.user` contains authenticated user info
    if (req.user && req.user.isAdmin === true) {
        next(); // User is an admin, proceed to the next function
    } else {
        return res.status(403).json({ message: "Access denied: Admins only." });
    }
  }
   
// Load users from CSV file into memory
function loadUsersFromCSV() {
    return new Promise((resolve, reject) => {
        const userArray = [];
        fs.createReadStream('./router/users.csv')
            .pipe(csvParser())
            .on('data', (row) => {
                userArray.push(row);
            })
            .on('end', () => {
                console.log('Users from CSV file successfully processed');
                resolve(userArray);
            })
            .on('error', (err) => {
                reject(err);
            });
    });
}

// add new user information into CSV file
async function addNewUserIntoCSV (user_info) {
    try {
        users.push(user_info);
        await new Promise((resolve, reject) => {
            const writeStream = fs.createWriteStream("./router/users.csv");
            fastCsv
                .write(users, { headers: true }) 
                .pipe(writeStream)
                .on('finish', resolve)
                .on('error', reject);
        });

        console.log('Users from CSV file updated successfully!');
    } catch (error) {
        console.error('Error updating users from CSV file:', error);
    }
}

// Load users data when the server starts
loadUsersFromCSV()
    .then((userArray) => {
        users = userArray;
        console.log(users);
    })
    .catch((err) => console.error(err));

// Load books data when the server starts
loadBooksFromCSV()
    .then((bookArray) => {
        console.log("Books loaded successfully:", bookArray);
    })
    .catch((err) => {
        console.error("Error loading books:", err);
    });

const isValid = (username)=>{ //returns boolean
//write code to check is the username is valid
    let userWithSameName = users.filter(user => user.username === username);
    return (userWithSameName.length === 0) ? true : false;
}

const authenticatedUser = (username,password)=>{ //returns boolean
// Filter the users array for any user with the same username and password
    let validusers = users.filter((user) => {
        return (user.username === username && user.password === password);
    });
    // Return true if any valid user is found, otherwise false
    if (validusers.length > 0) {
        return true;
    } else {
        return false;
    }
}

//only registered users can login
regd_users.post("/login", (req,res) => {
  //Write your code here
  const loginUserName = req.body.username;
  const loginPassword = req.body.password;

  if (!loginUserName || !loginPassword) {return res.status(404).json({message: "Missing Input"});}

  if (authenticatedUser(loginUserName, loginPassword)) {
        // Generate JWT access token
        let accessToken = jwt.sign({
            data: loginPassword,
            isAdmin: (users.find(user => user.username === loginUserName).isAdmin === 'true')
            // add isAdmin status in jwt
        }, 'access', { expiresIn: 60 * 10 });

        // Store access token and username in session
        req.session.authorization = {
            accessToken, loginUserName
        }
        return res.status(200).send("User successfully logged in");
    } else {
        return res.status(208).json({ message: "Invalid Login. Check username and password" });
    }
});

// Main endpoint to be accessed by authenticated users
regd_users.get("/auth/get_message", (req, res) => {
    console.log(req.user);
    return res.status(200).json({ message: "Hello, You are an authenticated user. Congratulations!" });
  });

  // Main endpoint to be accessed by authenticated admins
regd_users.get("/auth/admin/get_message", inspectAdmin ,(req, res) => {
    return res.status(200).json({ message: "Hello, You are an authenticated Admin. Congratulations!" });
  });


// Add a book review
regd_users.put("/auth/review/:isbn", async (req, res) => {
    const isbn = req.params.isbn;
    const newComment = req.body.review;

    try {    
        if (newComment) {
            await updateBooksReviewIntoCSV(newComment, isbn);

            const booksArray = await loadBooksFromCSV();
            books.length = 0;
            books.push(...booksArray);
            console.log(books);
            return res.status(200).json({ message: "The review is successfully updated. Now you can see the updated review" });
        } else {
            return res.status(400).json({ message: "Review content is required." });
        }
    } catch (error) {
        console.error(err);
        return res.status(500).json({ message: "Internal Server Error" });
    }
        
    
});

// Clear a book review
regd_users.delete("/auth/review/:isbn", async (req, res) => {
    const isbn = req.params.isbn;
    console.log("ISBN:", isbn);

    try { 
        const clearComment = '';
        await updateBooksReviewIntoCSV(clearComment, isbn);

        const booksArray = await loadBooksFromCSV();
        books.length = 0;
        books.push(...booksArray);
        console.log(books);
        return res.status(200).json({ message: "The review is successfully removed. Now you can see the updated review" });
    } catch (error) {
        console.error(err);
        return res.status(500).json({ message: "Internal Server Error" });
    }
});

// For admin only: add a new book
regd_users.post("/auth/admin/add_book", inspectAdmin, async (req, res) => {
    const newBookTitle = req.body.title;
    const newBookAuthor = req.body.author;
  
    if (!newBookTitle || !newBookAuthor) {
      return res.status(404).json({ message: "Missing Input" });
    }
  
    if (isValidBook(newBookTitle)) {
      new_book = { "title": newBookTitle, "author": newBookAuthor, "reviews": ""}
      
      await addBookIntoCSV(new_book);

       // Reload the books array from the CSV file
       const booksArray = await loadBooksFromCSV();
       books.length = 0; // Clear the existing users array
       books.push(...booksArray); // Update the users array with the latest data
       console.log(books);

      return res.status(200).json({ message: "Book is successfully added. Now you can check the book list" });
    } else {
      return res.status(404).json({ message: "Book already exists!" });
    }
  });

// For admin only: remove existing book
regd_users.delete("/auth/admin/remove_book", inspectAdmin, async (req, res) => {
    const removeBookTitle = req.body.title;
  
    if (!removeBookTitle) {
      return res.status(404).json({ message: "Missing Input" });
    }
  
    if (!isValidBook(removeBookTitle)) {
      await removeBookIntoCSV(removeBookTitle);

       // Reload the books array from the CSV file
       const booksArray = await loadBooksFromCSV();
       books.length = 0; // Clear the existing users array
       books.push(...booksArray); // Update the users array with the latest data
       console.log(books);

      return res.status(200).json({ message: "Book is successfully removed. Now you can check the book list" });
    } else {
      return res.status(404).json({ message: "Book is not found!" });
    }
  });

// logout
regd_users.post("/auth/logout", (req, res) => { // for user to logout
    if (req.session.authorization) { // Get the authorization object stored in the session
        token = req.session.authorization['accessToken'];
        blacklist.add(token);
        req.session.destroy((err) => {
            if (err) {
                return res.status(500).json({ message: 'Error logging out' });
            }
            return res.status(200).json({ message: 'User successfully logged out' });
        });
    } else {
        return res.status(400).json({ message: 'Authorization token not provided' });
    }
 });



module.exports.authenticated = regd_users; // module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
module.exports.blacklist = blacklist;
module.exports.addNewUserIntoCSV = addNewUserIntoCSV;
module.exports.loadUsersFromCSV = loadUsersFromCSV;