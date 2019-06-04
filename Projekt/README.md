## README - JS-THE-BEST


Starten:
 
 - Zum Ordner im Terminal navigieren
 - ```./node_modules/.bin/webpack``` (```--watch``` für Live Updates)


## Sprint I (01.06.2019)

# Bisher:
 - Game, Field, Player, Item (klassen) bereitgstellt
 - Darstellung möglich

# Planung :
 - Kommunikation schlank halten
 - GameState lokal und auf Server
  - möglichst kleiner Traffic
  - Ausgehend von zuverlässigen Netzwerken
  - Fehlerbehandlung, Server speichert  
  - GameState auf Server, für Fehlerkorrektur, Pause (evtl. Speichern)
 - Ausgehend, dass nur valide Moves gesendet werden

# Animation :
 - Move durchführen über animate() und render()
 - State update bei durchgeführten Move (target === newPosition)
![UML](Planung/BomberMan2.png



# Feststellung (04.06.2019):
 -> 0,25 Sekunden für Animation !!
	'-> Spielerposition ist beendet bei SpielerPos === Neues Feld
	'-> MUSS ZUÄCHST funktionieren !
