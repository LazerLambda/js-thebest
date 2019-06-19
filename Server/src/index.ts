

import * as express from "express";
import * as socketio from "socket.io";
import * as path from "path";
import * as GameBackEnd from "./Game";
//import * as Player from "./Player";

const app = express();
app.set("port", process.env.PORT || 3000);
app.use(express.static('dist'))

let http = require("http").Server(app);
let io = require("socket.io")(http);

app.get("/", (req: any, res: any) => {
  res.sendFile(path.resolve("./dist/index.html"));
});

let games : GameBackEnd.Game[] = [];
let connList : any[] = [];
let counter : number = 0;
io.on("connection", function(socket: any) {
  var test = new GameBackEnd.Player("sdaf", socket);
  // socket.join("game"+counter);
  // console.log("a user connected");
  if(counter % 4 === 0){ ++counter;console.log("4 erreicht");}
  console.log(io.connected);
  connList.push(socket);
  if(connList.length % 4 === 0 ){
    let tmpGame = connList.slice(0,4);
    games.push(new GameBackEnd.Game(
      new GameBackEnd.Player("Player0", tmpGame[0]),
      new GameBackEnd.Player("Player1", tmpGame[1]),
      new GameBackEnd.Player("Player2", tmpGame[2]),
      new GameBackEnd.Player("Player3", tmpGame[3]),
    ));
  }
  console.log(connList.length);

  // if(io.nsps['/'].adapter.rooms["game-"+counter] && io.nsps['/'].adapter.rooms["game-"+counter].length > 1) {counter++;}
  // socket.join("game-"+counter);

  // io.sockets.to("game-"+counter).emit('connectToRoom', "You are in room no. "+counter);
  console.log(Object.keys(io.sockets.sockets));

  // socket.on("disconnect", function(socket: any) {
  //   console.log("user disconnected");
  //   connList.filter(item => item !== socket)
  // });  
});


const server = http.listen(3000, function() {
  console.log("listening on *:3000");
});