import * as express from "express";
import * as socketio from "socket.io";
import * as path from "path";
import { GameBackend } from "./GameBackend";
import * as fs from "fs";
import { Game } from "./Game";

enum fieldType {
  HALLWAY = 0,
  WALL = 1,
  HOLE = 2,
  BRICK = 3
}

var file: any = fs.readFileSync("./Fields/Field0.json");
var field: Object = JSON.parse(file);
console.log(field);

const app = express();
app.set("port", process.env.PORT || 3000);
app.use(express.static("dist"));

let http = require("http").Server(app);
let io = require("socket.io")(http);

app.get("/", (req: any, res: any) => {
  res.sendFile(path.resolve("./dist/index.html"));
});

var connections = new Array();
var connectionCounter = 0;

var currentGames: any = [];

var queueEditor: any[] = [];
var queueGame: GameBackend[] = new Array();

var queueAll: any[] = [];

function createGame(ioObject: any): GameBackend {
  var game = new GameBackend(
    ioObject,
    queueAll[0],
    queueAll[1],
    queueAll[2],
    queueAll[3]
  );
  return game;
}

io.on("connection", function(socket: any) {
  ++connectionCounter;
  console.log("Connection established\n\t'-> Conn Nr : " + connectionCounter);
  queueAll.push(socket);
  console.log(queueAll.length);

  socket.on("mode", function(data: any) {
    connections.push(socket.id);
    console.log(socket.id + "has joined");
    console.log(data);
    if (data === "editor") {
      queueEditor.push(socket);
    }
    if (data === "game") {
      queueGame.push(socket);
    }

    socket.emit("S_ready", connectionCounter);
    console.log("emitted\n");
  });
  
  if(connectionCounter === 4){
    connectionCounter = 0;
  }


  if (queueAll.length === 4) {
    /////
    console.log("hier");
    queueGame.push(createGame(io));
    connectionCounter = 0;
    queueAll = [];
  }

  socket.on("G_ready", function(data: any) {
    console.log("G_ready received");
    console.log(data);
    socket.emit("init_field", field);
    console.log("Field sent");
  });

  socket.on("event", function(data: any) {
    // for(let i = 0; i < queueGame.length; i++){
    //   var val : boolean = queueGame[i].socketInGame(socket);
    //   if(val){
    //     console.log(i);
    //   }
    // }
    // var tmpGame = queueGame.find(
    //   e => e.socketInGame(socket)
    // );
  });

  socket.on("disconnecting", function(data: any) {
    console.log("disconnecting");
  });

  socket.on("disconnect", function(data: any) {
    connections.filter(e => e.id !== socket.id);
    console.log(connections);
  });
});
const server = http.listen(3000, function() {
  console.log("listening on *:3000");
});
