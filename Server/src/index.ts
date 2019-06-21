import * as express from "express";
import * as socketio from "socket.io";
import * as path from "path";
import * as Game from "./Game";
//import * as Player from "./Player";

const app = express();
app.set("port", process.env.PORT || 3000);
app.use(express.static("dist"));

let http = require("http").Server(app);
let io = require("socket.io")(http);

app.get("/", (req: any, res: any) => {
  res.sendFile(path.resolve("./dist/index.html"));
});

var roomno = 1;
var gameList: Game.Game[] = [];
io.on("connection", function(socket: any) {
  console.log("a user connected");

  if (
    io.nsps["/"].adapter.rooms["room-" + roomno] &&
    io.nsps["/"].adapter.rooms["room-" + roomno].length > 1
  ) {
    roomno++;
  }
  socket.join("room-" + roomno, () => {});

  if (io.nsps["/"].adapter.rooms["room-" + roomno].length === 2) {
    var tmpRoom: string = "room-" + roomno;
    gameList.push(new Game.Game(io, tmpRoom));

    // Maximale Spieleranzahl ist erreicht.
    console.log(gameList.length);
    io.sockets.in("room-" + roomno).emit("S_ready");
  }

  socket.on("G_ready", function(name: any) {
    console.log(name);
    var tmpGame = gameList.find(
      e => e.roomName === Object.keys(socket.rooms)[1]
    );
    tmpGame.addPlayer(socket, name);
    tmpGame.gameReady();
    console.log(name + "   " + socket.id + " added to game " + tmpGame.roomName);
  });

  socket.on("message", function(message: any) {
    var tmpGame = gameList.find(
      e => e.roomName === Object.keys(socket.rooms)[1]
    );
    console.log(message);
  });

  socket.on('move', function(move: any) {
    var tmpGame = gameList.find(
      e => e.roomName === Object.keys(socket.rooms)[1]
    );
    if(tmpGame === undefined){return;}
    tmpGame.sendMoveToPeers(socket, move);
    console.log(move);
  });

  socket.on("disconnecting", function(data: any) {
    var tmpGame = gameList.find(
      e => e.roomName === Object.keys(socket.rooms)[1]
    );
    if(tmpGame !== undefined){
      tmpGame.userLeft(socket);
      gameList = gameList.filter(e => e !== tmpGame);
    } else {return;}
  });

  socket.on("disconnect", function(data: any) {
    console.log("disconnected");
    var tmpGame = gameList.find(
      e => e.roomName === Object.keys(socket.rooms)[1]
    );
    if(tmpGame !== undefined){
      tmpGame.removeFromGame(socket);
      
    } else {return;}
    
  });
});
const server = http.listen(3000, function() {
  console.log("listening on *:3000");
});
