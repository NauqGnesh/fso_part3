const express = require('express');
const morgan = require('morgan');
const cors = require('cors');

const app = express();

app.use(express.json());
morgan.token('body', (req, res) => JSON.stringify(req.body));
app.use(
  morgan(
    ':method :url :status :response-time ms - :res[content-length] :body - :req[content-length]',
  ),
);
app.use(cors());
app.use(express.static('build'));

let persons = [
  {
    name: 'Arto Hellas',
    number: '040-123456',
    id: 1,
  },
  {
    name: 'Ada Lovelace',
    number: '39-44-5323523',
    id: 2,
  },
  {
    name: 'Dan Abramov',
    number: '12-43-234345',
    id: 3,
  },
  {
    name: 'Mary Poppendieck',
    number: '39-23-6423122',
    id: 4,
  },
];

const generateId = () => {
  const maxId = persons.length > 0 ? Math.max(...persons.map((n) => n.id)) : 0;
  return maxId + 1;
};

// app.get('/', (request, response) => {
//   response.send('<h2>Goto /api/person to see phonebook</h2>');
// });

app.get('/api/persons', (request, response) => {
  response.json(persons);
});

app.get('/api/info', (request, response) => {
  response.send(
    `<p>Phonebook has info for ${persons.length}</p> 
      <p>${new Date().toString()}</p>`,
  );
  response.send();
});

app.get('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id);
  const person = persons.find((p) => p.id === id);
  if (person) {
    response.json();
  } else {
    response.status(404).end();
    console.log('invalid id');
  }
});

app.delete('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id);
  const person = persons.filter((p) => p.id === id);
  if (person) {
    response.status(204).end();
  } else {
    response.status(404).end();
    console.log('invalid id');
  }
});

app.post('/api/persons', (request, response) => {
  const { body } = request;

  if (!body.name || !body.number) {
    return response.status(400).json({
      error: 'missing values',
    });
  }

  if (persons.find((p) => p.name === body.name)) {
    return response.status(400).json({
      error: 'person already exists',
    });
  }

  const person = {
    name: body.name,
    number: body.number,
    id: generateId(),
  };

  persons = persons.concat(person);

  return response.json(person);
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
