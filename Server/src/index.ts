import * as express from 'express';


// Create a new express application instance
const app: express.Application = express();

app.get('/', function (req :any, res : any) {
  res.send('Hello World!');
});

app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});