import * as express from "express";
import * as socketio from "socket.io";
import * as path from "path";
import * as Game from "./Game";
import * as fs from "fs";
//import * as Player from "./Player";

enum fieldType {
  HALLWAY = 0,
  WALL = 1,
  HOLE = 2,
  BRICK = 3
}

var file : any = fs.readFileSync("./Fields/Field0.json");
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

io.on("connection", function(socket: any) {
  socket.on("mode", function(data: any) {
    connections.push(socket.id);
    console.log(socket.id + "has joined");
    console.log(data);
    if (data === "editor") {
    }
    if (data === "game") {
    }
    socket.emit("S_ready", 1);
    console.log("emitted\n");
  });

  socket.on("G_ready", function(data: any) {
    console.log("G_ready received");
    console.log(data);
    socket.emit("init_field", field);
    console.log("Field sent");
  });

  socket.on("disconnect", function(data: any) {
    connections.filter(e => e.id !== socket.id);
    console.log(connections);
  });
});
const server = http.listen(3000, function() {
  console.log("listening on *:3000");
});
