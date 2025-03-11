# Environnement de développement

## Fichiers

Récupérer les archives :
* `geoserver.zip` à extraire dans `montages/geoserver` ;
* `mtd.zip` à extraire dans `montages/mtd` ;
* `images.zip` à extraire dans `montages/images`.

Si vous êtes sous GNU/Linux, lancez depuis ce dossier :
* `unzip geoserver.zip -d montages/geoserver/` ;
* `unzip mtd.zip -d montages/mtd/` ;
* `unzip images.zip -d montages/images/` ;

## Lancement de l'environnement de dév

Lancer l'environnement de dev avec :

```
docker compose up -d
```

Vérifiez que :
* GeoServer fonctionne via le lien (compte : `admin` / `geoserver`) : http://localhost:8088/geoserver/
* iipsrv fonctionne via le lien : http://localhost:8080/fcgi-bin/iipsrv.fcgi?FIF=Misphot_Image/Lambert93/2021/2021_FD%2001_C_20/21FD0120x00001_03343.jp2&JTL=7,3457
* apache "mtd" fonctionne via le lien : http://localhost:8081/Misphot/Lambert93/1000/1000_AERODROME%20CREIL_C_100/1000_AERODROME%20CREIL_C_100.txt
* apache "img" fonctionne via le lien : http://localhost:8082/Misphot_Image/Lambert93/2021/2021_FD%2001_C_20/21FD0120x00001_03343.jp2

## Développement

À partir de là vous pouvez commencer le développement en utilisant les applicatifs comme si vous étiez en prod !

(Il faudra relancer le `docker compose` à chaque redémarrage du PC, sauf à décommenter les `restart: unless-stopped`.)

Il faudra, dans la configuration de votre solution, permettre de définir les points d'entrée suivants :

* GeoServer : permet de connaître les missions/cartes disponibles ;
* iipsrv : permet de visualiser des JP2 via streaming (avec [iipmooviewer](https://github.com/ruven/iipmooviewer)) ;
* mtd : permet de récupérer les fichiers de métadonnées (XML, XML archive et TXT) via le web ;
* images : permet de récupérer les fichiers images via le web.

Pour les deux derniers services, il faudra une entrée "métropole" et une entrée "monde".
