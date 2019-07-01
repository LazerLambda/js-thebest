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


io.on("connection", function(socket: any) {
  socket.on('mode', function(data : any){
    console.log(data);
    if (data === 'editor'){

    }
    if (data === 'game'){

    }
    socket.emit('S_ready', "Name");
    console.log("emitted\n");
  });

  socket.on('G_ready', function(data : any){
    console.log("G_ready received");
    console.log(data);
  });
});
const server = http.listen(3000, function() {
  console.log("listening on *:3000");
});
