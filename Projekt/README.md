## README - JS-THE-BEST


Starten:
 
 - Zum Ordner im Terminal navigieren
 - ```./node_modules/.bin/webpack``` (```--watch``` für Live Updates)
 - Build im Ordner /dist 
 - Aufrufen mit index.html



Git:
 - ```git branch <Branch, der entstehen soll = A>```
 - ```git checkout <neuer Branch = A>```

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
 - 0,25 Sekunden für Animation !!
	- Spielerposition ist beendet bei SpielerPos === Neues Feld (Erst dann update)
	- MUSS ZUÄCHST funktionieren !
 - Spiellogik und Spielzugvalidierung gehen Hand in Hand
 - Animation und Bombenexplosionen
 	- Bombenexplosion designen
	- Bombenexplosionen auf Bombenobjekt (Feld wird übergen)

# Besprechung (04.06.2019):
 - Zunächst Möglichkeit zu laufen überprüfen.
 - Danach Running auf true, Richtung festlegen (Enum)
 - Grid, erst running auf false, wenn Spieler Pos === Ziel
 - In Items Methode einrichten, die wouldCollide beahndelt
 - 
