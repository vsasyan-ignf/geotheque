function roundToTwo(num) {
  //function qui arondit a 10 puissance-2
  return Math.round(num * 100) / 100
}

export async function parcour_txt_to_tab(url) {
  //function qui retourne le tab avec tab[0]="Centre Actif",coordx,coordy
  //Tab[1] =  "Cliche Actif",coordx,coordy,et les points delta x,y.
  // Tab 2 meme que Tab0 mais pour le point suivnat
  try {
    const reponse = await fetch(url)
    const data = await reponse.text()

    let lignes = data.split('\n')
    let taille_file = lignes.length
    let i,
      y,
      taille_ligne,
      mots,
      coord_x,
      coord_y,
      base_x,
      base_y,
      centre_x,
      centre_y,
      previous_x,
      previous_y,
      nom_numero_photo,
      numero
    let tab2
    let tab_fin = []

    for (i = 0; i < taille_file; i++) {
      let line = lignes[i]
      mots = line.split('\t')
      taille_ligne = mots.length
      tab2 = []
      if (mots.length > 3 && mots[2] == 'Centre Actif') {
        centre_x = roundToTwo(parseFloat(mots[taille_ligne - 3]));
        centre_y = roundToTwo(parseFloat(mots[taille_ligne - 2]));
        nom_numero_photo = mots[3];
        numero = mots[9];

        const infos = {
          nom: nom_numero_photo,
          chantier: mots[5],
          date_vol: mots[7],
          numero: mots[9],
          heure: mots[10],
          res_min: mots[13],
          res_moy: mots[14],
          res_max: mots[15],
          altitude: mots[16],
          zicad: mots[17],
          conditions_pdv: mots[19],
          dispo: mots[20],
          focale: mots[21],
          format: mots[22]
        }

        tab2.push('Centre Actif');
        tab2.push(centre_x, centre_y, nom_numero_photo, numero, infos);
        tab_fin.push(tab2);
      } else if (mots.length > 3 && mots[2] == 'Cliche Actif') {
        if (mots.length < 28) {
          console.error('Problème longueur Cliche Actif')
        }
        tab2.push('Cliche Actif')
        base_x = roundToTwo(parseFloat(mots[11]))
        base_y = roundToTwo(parseFloat(mots[12]))

        previous_x = base_x
        previous_y = base_y

        tab2.push(base_x, base_y)

        for (y = 14; y < mots.length - 3; y = y + 2) {
          coord_x = roundToTwo(previous_x + parseFloat(mots[y]))
          coord_y = roundToTwo(previous_y + parseFloat(mots[y + 1]))
          tab2.push(coord_x, coord_y)

          previous_x = coord_x
          previous_y = coord_y
        }
        coord_x = parseFloat(mots[mots.length - 2])
        coord_y = parseFloat(mots[mots.length - 1].split('\r')[0])
        tab2.push(roundToTwo(previous_x + coord_x), roundToTwo(previous_y + coord_y))
        tab_fin.push(tab2)
      }
      else if (mots.length > 3 && mots[2] == 'Couple Actif') {
        if (mots.length < 18) {
          console.error('Problème longueur Couple Actif')
        }
        tab2.push('Couple Actif')
        base_x = roundToTwo(parseFloat(mots[11]))
        base_y = roundToTwo(parseFloat(mots[12]))
        previous_x = base_x
        previous_y = base_y

        tab2.push(base_x, base_y)

        for (y = 14; y < mots.length; y = y + 2) {
          coord_x = roundToTwo(previous_x + parseFloat(mots[y]))
          coord_y = roundToTwo(previous_y + parseFloat(mots[y + 1]))
          tab2.push(coord_x, coord_y)

          previous_x = coord_x
          previous_y = coord_y
        }
        tab_fin.push(tab2)
      }
    }
    return tab_fin
  } catch (error) {
    console.error('Erreur lors de la lecture du fichier :', error)
  }
}
