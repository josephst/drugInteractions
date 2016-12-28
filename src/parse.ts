/* tslint:disable no-console */

import fs = require('graceful-fs');
import xml2js = require('xml2js');

interface IParsedDrug {
  'drugbank-id': [String];
  name: [String];
  description: [String];
  indication: [String];
  'drug-interactions': [IInteractionContainer];
}

interface IInteractionContainer {
  'drug-interaction': [IDrugInteraction];
}

interface IDrugInteraction {
  'drugbank-id': [String];
  description: [String];
  name: [String];
}

interface INode {
  group: 'nodes';
  data: {
    id: string,
    description?: string,
    indication?: string,
    name?: string,
  };
}

interface IEdge {
  group: 'edges';
  data: {
    id: string,
    source: string,
    target: string,
    description?: string,
    name?: string,
  }
}

const parser = new xml2js.Parser({
  trim: true,
  normalize: true,
  normalizeTags: true,
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
    const cyNodes: INode[] = [];
    const cyEdges: IEdge[] = [];
    files.forEach((file, index, fileArray) => {
      fs.readFile(`${splitFolder}/${file}`, (fileErr, fileData) => {
        if (fileErr) {
          console.log(fileErr);
        } else if (index === fileArray.length - 1) {
          fs.writeFile(`${splitFolder}/../nodes-small.json`, JSON.stringify(cyNodes, null, 2));
          fs.writeFile(`${splitFolder}/../edges-small.json`, JSON.stringify(cyEdges, null, 2));
        } else {
          if (index % 100 === 0) {
            console.log(index);
          }
          parser.parseString(fileData, (parseErr: Error, parsedDrug: IParsedDrug) => {
            if (parseErr) {
              console.log(parseErr);
            } else {
              const id = parsedDrug['drugbank-id'][0];
              const interactions = parsedDrug['drug-interactions'][0]['drug-interaction'];
              cyNodes.push(<INode> {
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
                  cyEdges.push(<IEdge> {
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
