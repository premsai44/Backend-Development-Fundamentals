const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "books.db");
let db = null;

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

app.get("/books/", async (request, response) => {
  try {
    const {
      search_q = "",
      order_by = "id",
      order = "ASC",
      limit = 10,
      offset = 0,
      min_price,
      max_price,
    } = request.query;

    const allowedOrderColumns = ["id", "title", "author", "price", "pages"];
    const safeOrderBy = allowedOrderColumns.includes(order_by.toLowerCase())
      ? order_by.toLowerCase()
      : "id";

    const safeOrder = order.toUpperCase() === "DESC" ? "DESC" : "ASC";

    const parsedLimit = parseInt(limit, 10) > 0 ? parseInt(limit, 10) : 10;
    const parsedOffset = parseInt(offset, 10) >= 0 ? parseInt(offset, 10) : 0;

    const conditions = [];
    const queryParams = [];

    if (search_q.trim() !== "") {
      conditions.push("title LIKE ?");
      queryParams.push(`%${search_q.trim()}%`);
    }

    const hasMinPrice = min_price !== undefined && min_price !== "" && !isNaN(Number(min_price));
    const hasMaxPrice = max_price !== undefined && max_price !== "" && !isNaN(Number(max_price));

    if (hasMinPrice && hasMaxPrice) {
      conditions.push("price BETWEEN ? AND ?");
      queryParams.push(Number(min_price), Number(max_price));
    } else if (hasMinPrice) {
      conditions.push("price >= ?");
      queryParams.push(Number(min_price));
    } else if (hasMaxPrice) {
      conditions.push("price <= ?");
      queryParams.push(Number(max_price));
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    const getBooksQuery = `
      SELECT *
      FROM book
      ${whereClause}
      ORDER BY ${safeOrderBy} ${safeOrder}
      LIMIT ? OFFSET ?;
    `;

    queryParams.push(parsedLimit, parsedOffset);

    const booksArray = await db.all(getBooksQuery, queryParams);
    response.status(200).json(booksArray);
  } catch (error) {
    response.status(500).json({ message: error.message });
  }
});

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
      return response.status(404).json({ message: "Book Not Found" });
    }

    response.status(200).json(book);
  } catch (error) {
    response.status(500).json({ message: error.message });
  }
});

app.post("/books/", async (request, response) => {
  try {
    const { title, author, price, pages } = request.body;

    if (!title || typeof title !== "string" || title.trim() === "") {
      return response.status(400).json({ message: "Title is required and must be a valid string" });
    }

    if (!author || typeof author !== "string" || author.trim() === "") {
      return response.status(400).json({ message: "Author is required and must be a valid string" });
    }

    if (price === undefined || price === null || isNaN(Number(price)) || Number(price) < 0) {
      return response.status(400).json({ message: "Price is required and must be a valid non-negative number" });
    }

    const pagesCount = pages !== undefined && !isNaN(Number(pages)) ? Number(pages) : 0;

    const addBookQuery = `
      INSERT INTO book (title, author, price, pages)
      VALUES (?, ?, ?, ?);
    `;

    const result = await db.run(addBookQuery, [title.trim(), author.trim(), Number(price), pagesCount]);
    const bookId = result.lastID;

    response.status(201).json({
      bookId: bookId,
      message: "Book Added Successfully",
    });
  } catch (error) {
    response.status(500).json({ message: error.message });
  }
});

app.put("/books/:bookId/", async (request, response) => {
  try {
    const { bookId } = request.params;
    const { title, author, price, pages } = request.body;

    const checkBookQuery = `SELECT * FROM book WHERE id = ?;`;
    const existingBook = await db.get(checkBookQuery, [bookId]);

    if (!existingBook) {
      return response.status(404).json({ message: "Book Not Found" });
    }

    if (!title || typeof title !== "string" || title.trim() === "") {
      return response.status(400).json({ message: "Title is required and must be a valid string" });
    }

    if (!author || typeof author !== "string" || author.trim() === "") {
      return response.status(400).json({ message: "Author is required and must be a valid string" });
    }

    if (price === undefined || price === null || isNaN(Number(price)) || Number(price) < 0) {
      return response.status(400).json({ message: "Price is required and must be a valid non-negative number" });
    }

    const pagesCount = pages !== undefined && !isNaN(Number(pages)) ? Number(pages) : existingBook.pages;

    const updateBookQuery = `
      UPDATE book
      SET title = ?, author = ?, price = ?, pages = ?
      WHERE id = ?;
    `;

    await db.run(updateBookQuery, [title.trim(), author.trim(), Number(price), pagesCount, bookId]);
    response.status(200).json({ message: "Book Updated Successfully" });
  } catch (error) {
    response.status(500).json({ message: error.message });
  }
});

app.delete("/books/:bookId/", async (request, response) => {
  try {
    const { bookId } = request.params;

    const checkBookQuery = `SELECT * FROM book WHERE id = ?;`;
    const existingBook = await db.get(checkBookQuery, [bookId]);

    if (!existingBook) {
      return response.status(404).json({ message: "Book Not Found" });
    }

    const deleteBookQuery = `
      DELETE FROM book
      WHERE id = ?;
    `;

    await db.run(deleteBookQuery, [bookId]);
    response.status(200).json({ message: "Book Deleted Successfully" });
  } catch (error) {
    response.status(500).json({ message: error.message });
  }
});

module.exports = app;
