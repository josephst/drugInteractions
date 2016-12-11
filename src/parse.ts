import fs = require('graceful-fs');
import xml2js = require('xml2js');

interface IParsedDrug {
  'drugbank-id': [String];
  name: [String];
  description: [String];
  indication: [String];
  'drug-interactions': [IInteractionContainer]
}

interface IInteractionContainer {
  'drug-interaction': [DrugInteraction];
}

interface DrugInteraction {
  'drugbank-id': [String];
  description: [String];
  name: [String];
}

interface ICyElement {
  group?: String;
  data: {
    id: String;
    description?: String;
    source?: String;
    target?: String;
    name?: String;
    indication?: String;
  }
}

const parser = new xml2js.Parser({
  trim: true,
  normalizeTags: true,
  normalize: true,
  ignoreAttrs: true,
  mergeAttrs: true,
  explicitArray: true,
  explicitRoot: false,
  // async: true,
});

const splitFolder = `${__dirname}/../data/sample`;

fs.readdir(splitFolder, (dirErr, files) => {
  if (dirErr) {
    console.log(dirErr);
  } else {
    const cyElements: ICyElement[] = [];
    files.forEach((file, index, fileArray) => {
      fs.readFile(`${splitFolder}/${file}`, (fileErr, fileData) => {
        if (fileErr) {
          console.log(fileErr);
        } else if (index === fileArray.length - 1) {
          fs.writeFile(`${splitFolder}/../elements-small.json`, JSON.stringify(cyElements, null, 2));
        } else {
          index % 100 === 0 && console.log(index);
          parser.parseString(fileData, (parseErr: Error, parsedDrug: IParsedDrug) => {
            if (parseErr) {
              console.log(parseErr);
            } else {
              const id = parsedDrug['drugbank-id'][0];
              const interactions = parsedDrug['drug-interactions'][0]['drug-interaction'];
              cyElements.push({
                group: 'nodes',
                data: {
                  id,
                  description: parsedDrug.description[0],
                  indication: parsedDrug.indication[0],
                  name: parsedDrug.name[0],
                },
              });
              if (interactions && interactions.length > 0) {
                interactions.forEach((interaction) => {
                  cyElements.push({
                    group: 'edges',
                    data: {
                      id: `${id}-${interaction['drugbank-id'][0]}`,
                      source: id,
                      target: interaction['drugbank-id'][0],
                      description: interaction.description[0],
                      name: interaction.name[0],
                    },
                  });
                });
              }
            }
          });
        }
      });
    });
  }
});
