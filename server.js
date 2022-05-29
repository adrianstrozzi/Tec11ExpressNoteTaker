const { readAndAppend, readFromFile, writeToFile } = require('./helpers/fsUtils');
const express = require('express');
const path = require('path');
const uuid = require('./helpers/uuid');

const app = express();
const PORT = process.env.PORT || 3001


app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());


// GET method return index.html when visiting the root path
app.get('/', (req, res) =>
  res.sendFile(path.join(__dirname, './public/index.html'))
);

// GET method to return notes.html when visitin the notes path
app.get('/notes', (req, res) =>
  res.sendFile(path.join(__dirname, './public/notes.html'))
);

// GET method to return the updated notes from the db to the HTML
app.get('/api/notes', (req, res) => {
  console.info(`${req.method} request received to get Notes`);
  return res.sendFile(path.join(__dirname, './db/db.json'));
});



// POST Route for submitting feedback
app.post('/api/notes', (req, res) => {
  // Destructuring assignment for the items in req.body
  const { title, text } = req.body;
  // If all the required properties are present
  if (req.body) {
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
    console.info(`New note with ID ${newNote.id} created.`);
  } else {
    res.json('Error in posting note');
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
      res.json(result);
      console.info(`Note with ID ${noteId} deleted.`);
    });
});

app.listen(PORT, () =>
  console.log(`Express server listening on port ${PORT}!`)
);