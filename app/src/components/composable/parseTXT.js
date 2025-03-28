function roundToTwo(num) {
  return Math.round(num * 100) / 100
}

export function parcour_txt_to_tab(url) {
  //function qui retourne le tab avec tab[0]="Centre Actif",coordx,coordy
  //Tab[1] =  "Cliche Actif",coordx,coordy,et les points delta x,y.
  // Tab 2 meme que Tab0 mais pour le point suivnat
  fetch(url)
    .then((response) => response.text())
    .then((data) => {
      var lignes = data.split('\n')
      var taille_file = lignes.length
      var i, y, taille_ligne, mots, coord_x, coord_y, base_x, base_y
      let tab2
      let tab_fin = []

      for (i = 0; i < taille_file; i++) {
        var line = lignes[i]
        mots = line.split('\t')
        taille_ligne = mots.length
        tab2 = []
        if (mots.length > 3 && mots[2] == 'Centre Actif') {
          coord_x = mots[taille_ligne - 3]
          coord_y = mots[taille_ligne - 2]
          tab2.push('Centre Actif')
          tab2.push(coord_x, coord_y)

          tab_fin.push(tab2)
        } else if (mots.length > 3 && mots[2] == 'Cliche Actif') {
          tab2.push('Cliche Actif')
          base_x = mots[11]
          base_y = mots[12]
          tab2.push(base_x, base_y)
          if (mots.length < 28) {
            console.error('Problème longueur Cliche Actif')
          }
          for (y = 14; y < mots.length - 3; y = y + 2) {
            coord_x = base_x + mots[y]
            coord_y = base_y + mots[y + 1]
            tab2.push(coord_x, coord_y)
          }
          coord_x = mots[mots.length - 2]
          coord_y = mots[mots.length - 1].split('\r')[0]
          tab2.push(base_x + coord_x, base_y + coord_y)
          tab_fin.push(tab2)
        }
      }
      console.log(tab_fin)
      return tab_fin
    })
    .catch((error) => {
      console.error('Erreur lors de la lecture du fichier :', error)
    })
}
