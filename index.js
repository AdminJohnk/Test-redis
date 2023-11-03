const axios = require('axios');
const express = require('express');
const app = express();
const redis = require('redis');

// const client = redis.createClient();

// Cloud
// const client = redis.createClient({
//   username: 'default',
//   password: 'j04OBryvzBPJalN9Zu69RGaBhYYM9bJH',
//   socket: {
//     host: 'redis-19022.c295.ap-southeast-1-1.ec2.cloud.redislabs.com',
//     port: '19022'
//   }
// });

// Render
const client = redis.createClient({
  url: 'redis://red-cl283g2l7jac73fanab0:6379'
});

const runRedis = async () => {
  client.on('connect', () => {
    console.log(`Redis connected`);
  });

  client.on('error', () => {
    console.log(`Redis connect failed`);
  });

  await client.connect();
};

runRedis().catch(err => {
  console.log(err);
  throw new Error(err);
});

app.get('/data/:searchtext', async (req, res) => {
  const searchtext = req.params.searchtext;

  console.time('TIMEPROCESS::');
  const result = await client.GET(searchtext);
  console.timeEnd('TIMEPROCESS::');
  if (result) {
    console.log('GET');
    return res.status(200).send({
      message: `Data for ${searchtext} from the cache successfully`,
      data: JSON.parse(result)
    });
  } else {
    console.log('SET');
    const recipe = await axios.get(
      `https://jsonplaceholder.typicode.com/${searchtext}`
    );
    client.SET(searchtext, JSON.stringify(recipe.data));
    return res.status(200).send({
      message: `Data for ${searchtext} from the server successfully`,
      data: recipe.data
    });
  }
});

const port = 4000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
