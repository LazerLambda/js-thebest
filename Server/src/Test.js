
const express = require( "express" );
const app = express();
const fs = require('fs'); 
const port = 3001; // default port to listen
var http = require('http').createServer(app);
var io = require('socket.io')(http);


//express.static(root, [options])
app.use(express.static('public'))


// define a route handler for the default home page
app.get( "/", ( req, res ) => {
    fs.readFile('index.html', function(err, data) {
        res.writeHead(200, {'Content-Type': 'text/html'});
        res.write(data);
        res.end();
      });
} );


app.post( "/game", ( req, res ) => {
    fs.readFile('bundle.js', function(err, data) {
        res.writeHead(200, {'Content-Type': 'text/javascript'});
        res.write(data);
        res.end();
      });
} );

io.on('connection', function(socket) {
    console.log("a user connected");
  });

// io.on('connection', function(socket) {
//     socket.on('event', payload =>{
//         console.log(`Received: ${payload.greeting}`);
//         socket.emit('event', {greeting:'hello client'});})
// });


// start the Express server
app.listen( port, () => {
    console.log( `server started at http://localhost:${ port }` );
} );