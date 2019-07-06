
export class GameBackend{

    sockets : any[] = [];
    gameNumber : any = 0;
    io : any;

    constructor(ioObject : any, socket1: any, socket2 : any, socket3 : any, socket4 : any){
        this.io = ioObject;
        this.sockets.push(socket1);
        this.sockets.push(socket2);
        this.sockets.push(socket3);
        this.sockets.push(socket4);
        console.log("Game created");
    }


    /**
     * @description
     * In dieser Funktion soll rekursiv überprüft werden, ob ein gesuchter Socket in 
     * diesem Spiel vorhanden ist oder nicht. 
     * @param: socket
     * @return: boolean 
     */
    public socketInGame(socket : any) : boolean{
        var listTmp = this.sockets.slice();

        function getSock(list : any[]) : boolean{
            if(list.length === 0){return false;}
            else {
                return (list.pop().id === socket.id || getSock(list));
            }
        }
        return getSock(listTmp);
    }


    sendEventsToPeers(eventObjectToSend : any){
        var playerNrTMP : number = <number> eventObjectToSend['playerId'];

        for(let i = 0; i < this.sockets.length; i++){
            if(playerNrTMP === i){
                continue;
            } else {
                this.sockets[i].emit(eventObjectToSend);
            }
        }
    }
}
