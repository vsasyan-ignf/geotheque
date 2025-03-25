export function parcour_txt_to_tab(layerId) {
    var Text = "/home/formation/Documents/projet_final/francetransfert-776476740/mtd_light/Misphot/Lambert93/1000/1000_AERODROME CREIL_C_100/1000_AERODROME CREIL_C_100.txt";
    var lignes = Text.split("\n");
    var taille_file = lignes.length;
    var i, y, elem, taille_ligne, mots;
    let tab2;
    let tab_fin

    for (i = 0; i < taille_file; i++) {
        var line = lignes[i];
        mots = line.split("  ");
        taille_ligne = mots.length;
        tab2 = [];
        for (y = 0; y < taille_ligne; y++) {
            tab2.push(mots[y]);
        }
        tab_fin.push(tab2);
    }
    console.log(tab_fin);
}