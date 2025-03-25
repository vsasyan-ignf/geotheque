export function parcour_txt_to_tab(url) {
    fetch(url)
        .then(response => response.text())
        .then(data => {
            var lignes = data.split("\n");
            var taille_file = lignes.length;
            var i, y, elem, taille_ligne, mots;
            let tab2;
            let tab_fin = [];

            for (i = 0; i < taille_file; i++) {
                var line = lignes[i];
                mots = line.split("\t");
                taille_ligne = mots.length;
                tab2 = [];
                for (y = 0; y < taille_ligne; y++) {
                    tab2.push(mots[y]);
                }
                tab_fin.push(tab2);
            }
            console.log(tab_fin);
        })
        .catch(error => {
            console.error("Erreur lors de la lecture du fichier :", error);
        });
}