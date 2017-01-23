/* eslint-disable no-console */

import * as axios from 'axios';
import cytoscape from 'cytoscape';
/* eslint-disable no-unused-vars */
import bootstrap from '../node_modules/bootstrap/dist/css/bootstrap.css';
import customStyles from './css/main.css';
/* eslint-enable no-unused-vars */

const graph = window.cy = cytoscape({
  container: document.getElementById('cy'),
});

let nodes = [];
let edges = [];
axios.get('/data/nodes-small.json')
  .then((nodeResponse) => {
    nodes = nodeResponse.data;
    graph.add(nodes);
    axios.get('/data/edges-small.json')
      .then((edgeResponse) => {
        edges = edgeResponse.data;
        graph.add(edges);
        graph.layout({ name: 'grid' });
      });
  })
  .catch(err => console.log(err));
