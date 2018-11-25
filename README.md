# Npm-registry
API created to GET informations from the official [NPM API registry](https://github.com/npm/registry/blob/master/docs/REGISTRY-API.md).

## Getting Started

This package is available in the Node Package Repository and can be easily installed with [npm](https://docs.npmjs.com/getting-started/what-is-npm) or [yarn](https://yarnpkg.com).

```bash
$ npm i @slimio/npm-registry
# or
$ yarn add @slimio/npm-registry
```

## Usage example

```js
const Registry = require("@slimio/npm-registry");

async function main() {
    const npmReg = new Registry();

    // Retrieve meta data
    const metaData = await npmReg.metaData();
    console.log(metaData);

    // Search a given package
    const pkg = await npmReg.package("@slimio/is");
    console.log(pkg.lastVersion);

    // Search full-text
    const results = await npmReg.search({
        text: "author:fraxken"
    });
    console.log(JSON.stringify(results, null, 2));
}
main().catch(console.error);
```

## API
TBC
