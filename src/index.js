/* eslint-disable no-console */

import * as axios from 'axios';
import cytoscape from 'cytoscape';
/* eslint-disable no-unused-vars */
// Bootstrap CSS
import bootstrapCSS from '../node_modules/bootstrap/dist/css/bootstrap.css';
import customCSS from './css/main.css';
// Bootstrap JS
import bscollapse from '../node_modules/bootstrap/js/collapse';
import bstransition from '../node_modules/bootstrap/js/transition';
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

function searchListener(e) {
  e.preventDefault();
  const searchText = e.target.value;
  console.log(searchText);
}
const searchBox = document.getElementById('drugSearchText');
searchBox.addEventListener('keyup', searchListener);
