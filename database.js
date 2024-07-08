// database.js
const sqlite3 = require("sqlite3").verbose();

// Connect to SQLite database
const db = new sqlite3.Database("./botMemory.db", (err) => {
  if (err) {
    console.error("Could not connect to database", err);
  } else {
    console.log("Connected to database");
  }
});

// Create a table to store messages
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId TEXT,
      question TEXT,
      response TEXT,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
});

// Function to add a message to the database
const addMessage = (userId, question, response) => {
  db.run(
    `INSERT INTO messages (userId, question, response) VALUES (?, ?, ?)`,
    [userId, question, response],
    (err) => {
      if (err) {
        console.error("Error adding message to database", err);
      }
    },
  );
};

// Function to retrieve message history for a user
const getMessageHistory = (userId, callback) => {
  db.all(
    `SELECT question, response, timestamp FROM messages WHERE userId = ? ORDER BY timestamp DESC LIMIT 10`,
    [userId],
    (err, rows) => {
      if (err) {
        console.error("Error retrieving message history", err);
        callback([]);
      } else {
        callback(rows);
      }
    },
  );
};

// Function to find a previously answered question
const findPreviousResponse = (question, callback) => {
  db.get(
    `SELECT response FROM messages WHERE question = ? LIMIT 1`,
    [question],
    (err, row) => {
      if (err) {
        console.error("Error finding previous response", err);
        callback(null);
      } else {
        callback(row ? row.response : null);
      }
    },
  );
};

module.exports = { addMessage, getMessageHistory, findPreviousResponse };
