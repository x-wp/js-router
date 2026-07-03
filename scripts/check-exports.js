const { readFileSync } = require('fs');

const packageJson = JSON.parse(readFileSync('package.json', 'utf8'));
const cjs = require(packageJson.name);

if (typeof cjs.WpRouter !== 'function') {
  console.error('CommonJS bundle does not export WpRouter.');
  process.exit(1);
}

import(packageJson.name)
  .then((esm) => {
    if (typeof esm.WpRouter !== 'function') {
      console.error('ESM bundle does not export WpRouter.');
      process.exit(1);
    }

    console.log('CJS and ESM exports OK.');
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
