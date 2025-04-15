# Guide Utilisateur - Géothèque IGN

## Présentation

Le **Géothèque** est un outil réservé aux agents de l’IGN. Il est utilisé pour répondre aux demandes de personnes extérieures concernant deux types de données :

- Les **cartes anciennes**
- Les **photographies** anciennes ou récentes

Ces données peuvent provenir de **France** ou de **l’étranger**.

---

## 1. Cartes Anciennes - France

### Étapes de recherche

1. **Sélectionner le menu** : `Cartothèque France`
2. **Définir la zone de travail** via :
   - **Commune** : rechercher par nom
   - **Département** : rechercher par nom
   - **Pointé** : cliquer sur la carte

<img src="img/Carto_fr.png" alt="Selection sub tab" style="width:30%;"/>


> Pour les zones `Commune` et `Département`, tapez le nom dans la barre de recherche, puis sélectionnez dans la liste déroulante. 


<img src="img/search_commune.png" alt="Recherche par commune" style="width:30%;"/>

<img src="img/search_dep.png" alt="Recherche par departement" style="width:30%;"/>


> Pour la zone `Pointé`, cliquez sur l'emplacement désiré sur la carte, ou saisissez manuellement les coordonnées (Lambert 93, WGS84, Web Mercator).

<img src="img/point.png" alt="Pointé" style="width:40%;"/>


### Affiner la recherche (facultatif)

- **Année** : saisir une année minimale et/ou maximale
- **Échelle** : définir une échelle minimale et/ou maximale
- **Collection** : sélectionner dans la liste déroulante

<img src="img/critere.png" alt="Critère de sélection" style="width:30%;"/>


### Résultats

- Export possible au format **CSV**, avec les informations suivantes :
  - `id`
  - `libellé`
  - `année`
  - `couleur`
  - `type`

<img src="img/export_scan.png" alt="Exporter les scans" style="width:30%;"/>

- Possibilité de sélectionner une carte pour :
  - La **visualiser** dans une nouvelle fenêtre
  - La **télécharger**
  - Visualiser le **fichier XML** associé

<img src="img/result_scan.png" alt="options" style="width:30%;"/>

### Visualisation

Dans la fenêtre de visualisation :
- Zoom / Dézoom
- Rotation
- Réglage de la **luminosité** et du **contraste**

<img src="img/visu_carte.png" alt="visualisation de la carte" style="width:50%;"/>

---

## 2. Cartes Anciennes - Étranger

Le fonctionnement est similaire à celui de la **cartothèque France**, avec les différences suivantes :

- **Commune** → remplacée par **Feuille**
- **Département** → remplacé par **Pays**

<img src="img/carto_monde.png" alt="Cartothèque monde" style="width:20%;"/>

---

## 3. Photographies - France

### Sélection de la zone de travail

L'utilisateur peut choisir parmi :
- **Commune**
- **Département**
- **Feuille**
- **Point XY**
- ou effectuer une recherche **par nom de mission**

<img src="img/photo_fr.png" alt="Photothèque France" style="width:20%;"/>

### Affiner la recherche (facultatif)

- **Commanditaire** : saisie manuelle + sélection dans liste déroulante
- **Producteur** : idem
- **Support** et **Émulsion** : sélection dans liste déroulante

<img src="img/crit_photo.png" alt="Critère Photothèque" style="width:30%;"/>

### Sélection de la mission

Une fois la mission choisie, l'utilisateur peut :
- Visualiser les informations :
  - `Désignation`
  - `Dispo Photothèque`
  - `Échelle`
  - etc.

<img src="img/select_mission.png" alt="Sélection de la mission" style="width:30%;"/>

- Option : **Voir plus de détails** permet l'ensemble des informations de la mission.

<img src="img/info_all.png" alt="Information complète" style="width:30%;"/>


### Fonctions supplémentaires

- Ajouter les **emprises photos** sur la carte
- Supprimer des emprises individuelles ou toutes les emprises
- Télécharger le **CSV** associé
- Visualiser le **XML** de la mission
- Se déplacer vers l’emplacement de la mission

<img src="img/option_supp.png" alt="Fonction supplémentaire" style="width:30%;"/>

### Panier

- Passer sa souris au dessus d'une croix rouge affiche l'emprise de la photo ainsi que les informations de la photo

- Cliquer sur le **centre des photos** permet de les ajouter au panier

<img src="img/clic.png" alt="clic sur photo" style="width:50%;"/>

- Depuis le panier :
  - Visualiser la photo
  - Télécharger la photo
  - Supprimer la photo

<img src="img/panier.png" alt="panier" style="width:40%;"/>

---

## 4. Photographies - Étranger

Fonctionnement similaire à la **photothèque française**, avec une différence :

- Seules deux options disponibles pour définir la zone de travail :
  - **Feuille**
  - **Point XY**

<img src="img/photo_monde.png" alt="photothèque monde" style="width:40%;"/>

---

## 5. Bonus

### Raccourci

- Vous pouvez utiliser le raccourci pour vous déplacer dans un lieu précis sur la carte.

<img src="img/raccourci.png" alt="raccourci" style="width:40%;"/>

### Changement de fond de carte

- Vous pouvez changer le fond de carte en sélectionnant le fond de carte souhaité dans la fenêtre volante dans le coin en bas à droite.

<img src="img/basemap.png" alt="basemap" style="width:40%;"/>

### Ajout de couche vectorielle

- Vous pouvez ajouter une couche vectorielle dans la fenêtre volante dans le coin en bas à droite.

<img src="img/vecto.png" alt="Couche vectorielle" style="width:40%;"/>

### Cacher le fond de carte

- Vous pouvez cacher le fond de carte en cliquant sur l'icone en forme d'oeil en haut à droite.

<img src="img/hide.png" alt="Hide visibility" style="width:40%;"/>