# 🚀 Guide d'installation - Géothèque IGN

## ⬇️ Cloner le dépôt

```bash
git clone https://github.com/vsasyan-ignf/geotheque.git
cd geotheque
```

ou télécharger le zip et dézipper.

---

## 📁 Récupérer les archives

- `geoserver.zip` à extraire dans `montages/geoserver` ;
- `mtd.zip` à extraire dans `montages/mtd` ;
- `images.zip` à extraire dans `montages/images`.

---

## Lancement des services backend
Aller à la racine du projet et lancer la commande suivante :

```
sudo docker compose up -d
```

---

## Lancement du programme
D'abord aller dans le sous-dossier app.

- 1. Installer les dépendances avec la commande suivante :
```
npm install
```

- 2. Pour lancer en mode pour développeur ou en mode production, il faut lancer la commande suivante :
```
npm run dev
```

ou 
```
npm run prod
```
