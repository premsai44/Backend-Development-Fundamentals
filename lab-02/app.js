const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "books.db");
let db = null;

// Initialize Database connection and start the Express server
const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });

    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}/`);
    });
  } catch (error) {
    console.error(`DB Error: ${error.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

// Route 1: GET /books/ - Get all books
app.get("/books/", async (request, response) => {
  try {
    const getBooksQuery = `
      SELECT *
      FROM book
      ORDER BY id ASC;
    `;
    const booksArray = await db.all(getBooksQuery);
    response.status(200).json(booksArray);
  } catch (error) {
    response.status(500).json({ error: error.message });
  }
});

// Route 2: GET /books/:bookId/ - Get a single book by id
app.get("/books/:bookId/", async (request, response) => {
  try {
    const { bookId } = request.params;
    const getBookQuery = `
      SELECT *
      FROM book
      WHERE id = ?;
    `;
    const book = await db.get(getBookQuery, [bookId]);

    if (!book) {
      response.status(404).json({ error: "Book Not Found" });
    } else {
      response.status(200).json(book);
    }
  } catch (error) {
    response.status(500).json({ error: error.message });
  }
});

// Route 3: POST /books/ - Add a new book
app.post("/books/", async (request, response) => {
  try {
    const { title, author, price, pages } = request.body;

    if (!title || !author || price === undefined || pages === undefined) {
      return response.status(400).json({ error: "Missing required fields: title, author, price, pages" });
    }

    const addBookQuery = `
      INSERT INTO book (title, author, price, pages)
      VALUES (?, ?, ?, ?);
    `;

    const result = await db.run(addBookQuery, [title, author, price, pages]);
    const bookId = result.lastID;

    response.status(201).json({
      bookId: bookId,
      message: "Book Added Successfully",
    });
  } catch (error) {
    response.status(500).json({ error: error.message });
  }
});

// Route 4: PUT /books/:bookId/ - Update an existing book by id
app.put("/books/:bookId/", async (request, response) => {
  try {
    const { bookId } = request.params;
    const { title, author, price, pages } = request.body;

    if (!title || !author || price === undefined || pages === undefined) {
      return response.status(400).json({ error: "Missing required fields: title, author, price, pages" });
    }

    // Verify book exists
    const checkBookQuery = `SELECT * FROM book WHERE id = ?;`;
    const existingBook = await db.get(checkBookQuery, [bookId]);

    if (!existingBook) {
      return response.status(404).json({ error: "Book Not Found" });
    }

    const updateBookQuery = `
      UPDATE book
      SET title = ?, author = ?, price = ?, pages = ?
      WHERE id = ?;
    `;

    await db.run(updateBookQuery, [title, author, price, pages, bookId]);
    response.status(200).json({ message: "Book Updated Successfully" });
  } catch (error) {
    response.status(500).json({ error: error.message });
  }
});

// Route 5: DELETE /books/:bookId/ - Remove a book by id
app.delete("/books/:bookId/", async (request, response) => {
  try {
    const { bookId } = request.params;

    // Verify book exists
    const checkBookQuery = `SELECT * FROM book WHERE id = ?;`;
    const existingBook = await db.get(checkBookQuery, [bookId]);

    if (!existingBook) {
      return response.status(404).json({ error: "Book Not Found" });
    }

    const deleteBookQuery = `
      DELETE FROM book
      WHERE id = ?;
    `;

    await db.run(deleteBookQuery, [bookId]);
    response.status(200).json({ message: "Book Deleted Successfully" });
  } catch (error) {
    response.status(500).json({ error: error.message });
  }
});

module.exports = app;
