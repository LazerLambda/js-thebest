// import { SocketState } from "./SocketState";
import { Server } from "./Server";


export class GameBackend {
  sockets: any[] = [];
  server: Server = null;
  gameNumber: any = 0;

  constructor(sockets: any[], server: Server) {
    this.sockets = sockets;
    this.server = server;

    for(let e of sockets){
        console.log(e.id);
    }

    for (let e of sockets) {
      e.room = this;
    }

    for (let e of this.server.queue) {
      if (e.room !== null) {
        this.server.removeFromQueue(e);
      }
    }

    console.log("Game created");
  }

  /**
   * @description
   * In dieser Funktion soll rekursiv überprüft werden, ob ein gesuchter Socket in
   * diesem Spiel vorhanden ist oder nicht.
   * @param: socket
   * @return: boolean
   */
  public socketInGame(socket: any): boolean {
    var listTmp = this.sockets.slice();

    function getSock(list: any[]): boolean {
      if (list.length === 0) {
        return false;
      } else {
        return list.pop().socket.id === socket.id || getSock(list);
      }
    }
    return getSock(listTmp);
  }

  sendEventsToPeers(eventObjectToSend: any) {
    var playerNrTMP: number = <number>eventObjectToSend["playerId"];

    for (let i = 0; i < this.sockets.length; i++) {
      if (playerNrTMP === i) {
        continue;
      } else {
        this.sockets[i].socket.emit(eventObjectToSend);
      }
    }
  }
}
