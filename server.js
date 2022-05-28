const { readAndAppend, readFromFile, writeToFile } = require('./helpers/fsUtils');
const express = require('express');
const path = require('path');
const uuid = require('./helpers/uuid');

const app = express();
const PORT = process.env.PORT || 3001

const mainPath = path.join(__dirname, "/public")

const notes = require('./db/db.json');

app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get('*', (req, res) =>
  res.sendFile(path.join(mainPath, 'index.html'))
);

app.get('/notes', (req, res) =>
  res.sendFile(path.join(mainPath, 'notes.html'))
);

app.get('/api/notes', (req, res) => {
  console.info(`${req.method} request received to get Notes`);
  return res.json(notes);
});


// POST Route for submitting feedback
app.post('/api/notes', (req, res) => {
  // Destructuring assignment for the items in req.body
  const { title, text } = req.body;

  // If all the required properties are present
  if (title && text) {
    // Variable for the object we will save
    const newNote = {
      title,
      text,
      id: uuid(),
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


app.delete('/api/notes/:id', (req, res) => {
  const noteId = req.params.id;
  readFromFile('./db/db.json')
    .then((data) => JSON.parse(data))
    .then((json) => {
      // Make a new array of all notes except the one with the ID provided in the URL
      const result = json.filter((note) => note.id !== noteId);

      // Save that array to the filesystem
      writeToFile('./db/db.json', result);

      // Respond to the DELETE request
      res.json(`Note ${noteId} has been deleted 🗑️`);
    });
});

app.listen(PORT, () =>
  console.log(`Express server listening on port ${PORT}!`)
);