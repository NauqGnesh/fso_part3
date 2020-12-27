const express = require("express")
const morgan = require("morgan")
const cors = require("cors")
require("dotenv").config()
const Person = require("./models/person")

const app = express()

app.use(express.json())
morgan.token("body", (req, res) => JSON.stringify(req.body))
app.use(
	morgan(
		":method :url :status :response-time ms - :res[content-length] :body - :req[content-length]"
	)
)
app.use(cors())
app.use(express.static("build"))

app.get("/api/persons", (request, response) => {
	Person.find({}).then((person) => response.json(person))
})

app.get("/api/info", (request, response) => {
	Person.find({}).then((person) =>
		response.send(
			`<p>Phonebook has info for ${person.length} person</p> 
      <p>${new Date().toString()}</p>`
		)
	)
})

app.get("/api/persons/:id", (request, response, next) => {
	Person.findById(request.params.id)
		.then((person) => {
			if (person) {
				response.json(person)
			} else {
				response.status(404).end()
			}
		})
		.catch((error) => next(error))
})

app.delete("/api/persons/:id", (request, response, next) => {
	Person.findOneAndRemove(request.params.id)
		.then((result) => {
			response.status(204).end()
		})
		.catch((error) => next(error))
})

app.post("/api/persons", (request, response, next) => {
	const { body } = request

	const person = new Person({
		name: body.name,
		number: body.number,
	})

	person
		.save()
		.then((savedPerson) => {
			response.json(savedPerson)
		})
		.catch((error) => next(error))
})

app.put("/api/persons/:id", (request, response, next) => {
	const { body } = request

	const person = {
		name: body.name,
		number: body.number,
	}

	Person.findByIdAndUpdate(request.params.id, person, { new: true })
		.then((savedPerson) => {
			response.json(savedPerson)
		})
		.catch((error) => next(error))
})

const errorHandler = (error, request, response, next) => {
	console.error(error.message)

	if (error.name === "CastError") {
		return response.status(400).send({ error: "malformatted id" })
	}
	if (error.name === "ValidationError") {
		return response.status(400).send({ error: error.message })
	}

	next(error)
}

app.use(errorHandler)

const { PORT } = process.env
app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`)
})
