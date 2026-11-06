const path = require("path");
const sqlite3 = require("sqlite3").verbose();

const dbPath = path.join(__dirname, "books.db");

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error("Error opening database:", err.message);
    process.exit(1);
  }
  console.log("Connected to SQLite database at:", dbPath);
});

db.serialize(() => {
  // Drop table if exists to allow fresh re-initialization
  db.run("DROP TABLE IF EXISTS book");

  // Create book table
  db.run(`
    CREATE TABLE book (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      author TEXT NOT NULL,
      price INTEGER NOT NULL,
      pages INTEGER NOT NULL
    );
  `, (err) => {
    if (err) {
      console.error("Error creating table:", err.message);
      return;
    }
    console.log("Table 'book' created successfully.");
  });

  // Insert 10 rows
  const insertQuery = `
    INSERT INTO book (title, author, price, pages)
    VALUES (?, ?, ?, ?);
  `;

  const initialBooks = [
    ["The Great Gatsby", "F. Scott Fitzgerald", 399, 180],
    ["To Kill a Mockingbird", "Harper Lee", 499, 336],
    ["1984", "George Orwell", 299, 328],
    ["The Hobbit", "J.R.R. Tolkien", 599, 310],
    ["Pride and Prejudice", "Jane Austen", 249, 279],
    ["The Catcher in the Rye", "J.D. Salinger", 349, 234],
    ["The Alchemist", "Paulo Coelho", 299, 208],
    ["Harry Potter and the Sorcerer's Stone", "J.K. Rowling", 650, 309],
    ["Clean Code", "Robert C. Martin", 1199, 464],
    ["Atomic Habits", "James Clear", 550, 320]
  ];

  const stmt = db.prepare(insertQuery);
  initialBooks.forEach((book, index) => {
    stmt.run(book, function (err) {
      if (err) {
        console.error(`Error inserting book ${index + 1}:`, err.message);
      }
    });
  });

  stmt.finalize(() => {
    console.log(`Inserted ${initialBooks.length} sample books into 'book' table.`);
    
    // Verify inserted rows
    db.all("SELECT * FROM book", [], (err, rows) => {
      if (err) {
        console.error("Error selecting books:", err.message);
      } else {
        console.log("Initial database contents:");
        console.table(rows);
      }
      db.close();
    });
  });
});
