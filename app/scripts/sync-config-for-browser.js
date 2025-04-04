import fs from 'fs';
import path from 'path';

const env = process.env.NODE_ENV || 'development';
const inputPath = path.resolve('src/config.js');
const outputPath = path.resolve('public/iipmooviewer/config.js');

import(inputPath + `?t=${Date.now()}`).then((module) => {
  const config = module.default;
  if (!config) {
    console.error(`environnement '${env}' non trouvé`);
    process.exit(1);
  }

  const output = `// fichier généré automatiquement depuis app/src/config.js
// environnement: ${env}

const config = ${JSON.stringify(config, null, 2)};

export default config;
`;

  fs.writeFile(outputPath, output, (err) => {
    if (err) {
      console.error('erreur : ', err);
    } else {
      console.log(`config.js généré dans '${env}' → ${outputPath}`);
    }
  });
});
