import express from 'express';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';
import cors from 'cors';
import { createClient } from 'redis';

dotenv.config();

const app = express();

app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

app.use(cors());

const redisClient = createClient();
const connection = redisClient.connect();

let clicks = 0;

interface ClicksData {
  clicks: number;
}

app.get('/clicks/', async function (request, response) {
  const redis = await connection;
  const savedClicks = await redis.get('clicks');

  let result = 0;

  if (savedClicks !== null) {
    result = parseInt(savedClicks);
  }

  const data: ClicksData = {
    clicks: result,
  };
  response.send(data);
});

app.get('/', function (request, response) {
  response.send('Я живой и супер горячий!');
});

app.post('/clicks/', async function (request, response) {
  if (typeof request.body.clicks !== 'number') {
    response.sendStatus(400);
    return;
  }

  const data: ClicksData = request.body;
  clicks = data.clicks;
  const redis = await connection;
  await redis.set('clicks', data.clicks);

  const responseData: ClicksData = {
    clicks: data.clicks,
  };
  response.send(responseData);
});

app.delete('/clicks/', function (request, response) {
  clicks = 0;
  response.send(200);
});

const port = process.env.PORT;
app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
