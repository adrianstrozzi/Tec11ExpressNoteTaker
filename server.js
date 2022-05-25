const { readAndAppend, readFromFile } = require('./helpers/fsUtils');
const express = require('express');
const path = require('path');
const uuid = require('./helpers/uuid');
const fs = require("fs");

const app = express();
const PORT = 3001;

const notes = require('./db/db.json');

app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get('/', (req, res) =>
  res.sendFile(path.join(__dirname, 'public/index.html'))
);

app.get('/notes', (req, res) =>
  res.sendFile(path.join(__dirname, 'public/notes.html'))
);

app.get('/api/notes', (req, res) => {
  console.info(`${req.method} request received to get Notes`);
  return res.json(notes);
});

// POST Route for submitting feedback
app.post('/api/notes', (req, res) => {
  let savedNotes = JSON.parse(fs.readFileSync("./db/db.json", "utf8"));
  // Destructuring assignment for the items in req.body
  const { title, text } = req.body;

  // If all the required properties are present
  if (title && text) {
    // Variable for the object we will save
    const newNote = {
      title,
      text,
      note_id: uuid(),
    };

    readAndAppend(newNote, './db/db.json');

    const response = {
      status: 'success',
      body: newNote,
    };

    res.json(response);
  } else {
    res.json('Error in posting feedback');
  }
});

app.listen(PORT, () =>
  console.log(`Express server listening on port ${PORT}!`)
);