import express from 'express';
import { Ticket } from '../client/src/api';
import bodyParser = require('body-parser');
import { tempData } from './temp-data';
import { serverAPIPort, APIPath } from '@fed-exam/config';

console.log('starting server', { serverAPIPort, APIPath });

const app = express();

const PAGE_SIZE = 20;

app.use(bodyParser.json());

app.use((_, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', '*');
  res.setHeader('Access-Control-Allow-Headers', '*');
  next();
});

app.get(APIPath, (req, res) => {

  // @ts-ignore
  const page: number = req.query.page || 1;

  const paginatedData = tempData.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  res.send(paginatedData);
});

/**
 * API for updating the givin ticket by id with new title value 
 */
app.put(`${APIPath}/:id`, (req, res) => {
  const { id, newTilte } = req.params;
  const foundTicket = tempData.find(ticket => ticket.id === id);

  if (foundTicket !== undefined) {
    foundTicket.title = newTilte;
  }

  res.send(foundTicket);
})

/**
 * API for apending cloned ticket -> setting new creation time acoordinally current time
 */
app.post(APIPath, (req, res) => {
  const { id, title, content, userEmail } = req.body;
  const creationTime = Date.now();
  const newTicket: Ticket = { id, userEmail, title, content, creationTime };
  tempData.push(newTicket);

  res.send(newTicket);
});


app.listen(serverAPIPort);
console.log('server running', serverAPIPort)

