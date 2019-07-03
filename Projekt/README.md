# README - JS-THE-BEST


Starten:
 
 - Zum Ordner im Terminal navigieren
 - ```./node_modules/.bin/webpack``` (```--watch``` für Live Updates)
 - Build im Ordner /dist 
 - Aufrufen mit index.html



Git:
 - ```git branch <Branch, der entstehen soll = A>```
 - ```git checkout <neuer Branch = A>```

# Sprint I (01.06.2019)

## Bisher:
 - Game, Field, Player, Item (klassen) bereitgstellt
 - Darstellung möglich
 - Transition kann dargestellt werden
 - Bricks Klasse hinzugefügt
 - Kollisionen können getestet werden

## Planung :
 - Kommunikation schlank halten
 - GameState lokal und auf Server
  - möglichst kleiner Traffic
  - Ausgehend von zuverlässigen Netzwerken
  - Fehlerbehandlung, Server speichert  
  - GameState auf Server, für Fehlerkorrektur, Pause (evtl. Speichern)
 - Ausgehend, dass nur valide Moves gesendet werden
 

 - GameState als Objekt oder Klasse ?
 - Wie init des Feldes ?
 - Bombenlogik und Animation
   - Ändert sich state erst nach Explosion ?

## Animation :
 - evtl eigene Illustrationen
 - Animationen mit Spritesheets 


## Besprechung (04.06.2019):
 - Zunächst Möglichkeit zu laufen überprüfen.
 - Danach Running auf true, Richtung festlegen (Enum)
 - Grid, erst running auf false, wenn Spieler Pos === Ziel
 - In Items Methode einrichten, die wouldCollide beahndelt


 ## UML Diagram (07.06.2019):
 ![UML](Planung/BomberMan3.jpg)

 ## Vorschläge:
 - Power Ups 
  - Bewegungen schneller oder langsamer
  - Bombe größer
  - Rüstung

 - Sprungfeld
 - Bombe mit Player verbinden


## Besprech
