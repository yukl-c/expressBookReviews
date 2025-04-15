const fs = require("fs");
const books = require("./booksdb.js"); // Import the books object

function objectToCSV(obj) {
  // Extract headers (keys of each book object)
  const headers = ["isbn", "title", "author", "reviews"];

  // Start with the headers
  let csv = headers.join(",") + "\n";

  // Loop through the books object
  for (const [isbn, book] of Object.entries(obj)) {
    const reviews = book.reviews.length > 0 ? `"${book.reviews.join("; ")}"` : ""; // Handle multiple reviews
    csv += `${isbn},${book.title},${book.author},${reviews}\n`;
  }

  return csv;
}

// Convert the books object to a CSV string
const csvData = objectToCSV(books);

// Write the CSV string to a file
// const filePath = path.join("final_project/router/books", "books.csv");
fs.writeFileSync("final_project/router/books.csv", csvData, "utf8");

console.log("CSV file has been created: books.csv");