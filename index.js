const express = require('express')
const fs = require('fs/promises')

const app = express()

app.use(express.json())

const filePath = 'phonebook.json';
let contacts = []

//Get the contacts in contacts array on server startup
const init = async () => {
    try {
        const data = await fs.readFile(filePath, 'utf-8')
        contacts = JSON.parse(data)
    } catch(error) {
        console.log('Error loading contacts: ', error.message)
    }
};

init()

//Save contacts to the json file
async function saveContacts() {
    try {
        await fs.writeFile(filePath, JSON.stringify(contacts), 'utf-8')
        console.log('Contacts saved to file')
    } catch(error) {
        console.error('Error while saving contacts: ', error.message)
    }
}

app.get('/', (req, res) => {
    return res.json('Welcome to Phonebook API')
})


app.post('/addContact', (req, res) => {
    const { firstName, lastName, phoneNo, category } = req.body

    const existingContact = contacts.find(contact => 
        (contact.firstName === firstName &&
        contact.lastName === lastName) ||
        contact.phoneNo === phoneNo)

    if(existingContact)
        return res.status(400).json({status: 'error', message: 'Contact already exists'})

    let id = 1

    if(contacts.length > 0) 
        id = contacts[contacts.length - 1].id + 1
    
    contacts.push({firstName, lastName, phoneNo, category, id})
    
    saveContacts()

    return res.json({ status: 'success', id: id})
})


app.get('/contacts', (req, res) => {
    return res.json({ data: contacts})
})


app.get('/searchContact', (req, res) => {
    const query = req.query.q
    const fetchedContact = contacts.find(contact => 
        contact.firstName === query ||
        contact.lastName === query ||
        contact.phoneNo === query
    )

    if(!fetchedContact) 
        return res.status(404).json({status: 'error', message: 'Contact Not Found'})

    return res.status(200).json({status: 'success', data: fetchedContact})
})


app.delete('/deleteContact', (req, res) => {
    const query = req.query.q
    const contactIndex = contacts.findIndex(contact =>
        contact.firstName === query ||
        contact.lastName === query ||
        contact.phoneNo === query
    )

    if(!contactIndex)
        return res.status(404).json({status: 'error', message: 'Contact Not Found'})

    contacts.splice(contactIndex, 1)
    return res.status(200).json({status: 'success', message: 'Contact deleted'})
})


app.put('/updateContact', (req, res) => {
    const {firstName, lastName, phoneNo, id} = req.body
    const contactIndex = contacts.findIndex(contact => contact.id === id)

    if(contactIndex === -1)
        return res.status(404).json({status: 'error', message: 'Contact Not Found'})

    contacts[contactIndex] = {...contacts[contactIndex], firstName, lastName, phoneNo }

    saveContacts()

    return res.status(200).json({status: 'success', message: 'Contact updated'})
})


app.get('/searchCategory', (req, res) => {
    const query = req.query.q
    const newArray = contacts.filter(contact => contact.category === query)

    if(!newArray)
        return res.status(404).json({status: 'error', message: 'No such category'})

    return res.status(200).json({status: 'success', data: newArray})
})

app.listen(8000, () => console.log('App listening...'))