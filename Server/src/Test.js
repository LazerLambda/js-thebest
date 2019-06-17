
const express = require( "express" );
const fs = require('fs'); 
const port = 3000; // default port to listen


const app = express();
// define a route handler for the default home page
app.get( "/", ( req, res ) => {
    fs.readFile('index.html', function(err, data) {
        res.writeHead(200, {'Content-Type': 'text/html'});
        res.write(data);
        res.end();
      });
} );

// start the Express server
app.listen( port, () => {
    console.log( `server started at http://localhost:${ port }` );
} );