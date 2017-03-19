import * as axios from 'axios';
import cytoscape from 'cytoscape';
import debounce from 'lodash.debounce';
// Bootstrap and Font Awesome
import '../node_modules/bootstrap/dist/css/bootstrap.min.css';
import '../node_modules/font-awesome/css/font-awesome.min.css';
// my CSS
import './css/main.css';
// Bootstrap JS
import '../node_modules/bootstrap/js/dropdown';
import '../node_modules/bootstrap/js/collapse';

const graph = cytoscape({
  container: document.getElementById('cy'),
  style: [
    {
      selector: 'node',
      style: {
        label: 'data(name)',
      },
    },
    {
      selector: '.highlight',
      style: {
        'background-color': 'red',
      }
    },
  ],
});
window.cy = graph;

const layoutOptions = {
  name: 'random',
  boundingBox: { x1: 0, y1: 0, w: 1000, h: 1000 }
};

const apiPath = 'http://druginteractions.azurewebsites.net/apiV1/drugs';

async function getData(drugId) {
  const spinner = document.getElementById('loadingSpinner');
  spinner.classList.remove('hidden');
  let drug;
  try {
    drug = await axios.get(`${apiPath}/id/${drugId}`);
    document.getElementById('intro').classList.add('hidden');
  } catch (e) {
    // TODO: show error
  }
  spinner.classList.add('hidden');
  return drug;
}

/**
 * Add a node to the graph.
 * Description is optional (is only added if node is added directly;
 * will NOT be added when the drug is added as a target of another drug).
 * Description will later be added when the node is clicked on.
 * @param {string} id DrugbankId of node
 * @param {string} name Name of node
 * @param {string} [description] Description of drug
 */
function addNode(id, name, description) {
  graph.add({
    group: 'nodes',
    data: {
      id,
      name,
      description,
    },
    position: {
      x: -1000,
      y: -1000,
    },
  });
}

/**
 * Add edges from the clicked node (sourceId) to its interactions
 * @param {string} sourceId DrugbankId of the source node (the one that was clicked)
 * @param {Object[]} interactions Array of drug interactions
 * @param {string} interactions[].targetId DrugbankId of the target node
 * @param {string} interactions[].targetName Name of the drug that interacts with the clicked drug
 * @param {string} interactions[].description
 *   Description of the interaction
 *   (i.e. Drug B interferes with blood clotting when taken with Drug A)
 */
function addEdges(sourceId, interactions) {
  interactions.forEach((interaction) => {
    // make sure target exists before adding an edge to it
    if (graph.getElementById(interaction.targetId).length === 0) {
      addNode(interaction.targetId, interaction.targetName);
    }
    if (graph.getElementById(`${sourceId}-${interaction.targetId}`).length === 0) {
      graph.add({
        group: 'edges',
        data: {
          source: sourceId,
          target: interaction.targetId,
          targetName: interaction.targetName,
          description: interaction.description,
          id: `${sourceId}-${interaction.targetId}`,
          label: interaction.description,
        },
      });
    }
  });
}

/**
 * Rerun the layout
 */
function redoLayout() {
  graph.layout(layoutOptions);
}

/**
 * Add all interactions of the drug with `drugId` to graph
 * @param {string} drugId DrugbankId of clicked node
 */
async function addToGraph(drugId) {
  const res = await getData(drugId);
  return new Promise((resolve, reject) => {
    if (res && res.status >= 200 && res.status < 300) {
      const drug = res.data;
      if (graph.getElementById(drug.drugbankId).length === 0) {
        addNode(drug.drugbankId, drug.name, drug.description);
      } else {
        graph.$(`${drugId}`).data('description', res.data.description);
      }

      if (drug.interactions.length > 0) {
        addEdges(drug.drugbankId, drug.interactions);
      }

      redoLayout();
      graph.getElementById(`${drugId}`).select();
      resolve();
    } else {
      reject('not found');
    }
  });
}

function populateInfo(element) {
  const infoPlaceholder = document.getElementById('infoPlaceholder');
  const edgeInfo = document.getElementById('edgeInfo');
  const nodeInfo = document.getElementById('nodeInfo');
  infoPlaceholder.classList.remove('hidden');
  if (element && element.isNode()) {
    // Get info
    const id = element.id();
    const name = element.data('name');
    const description = element.data('description');
    const interactionEdges = element.outgoers('edge').map(edge =>
      [edge.data('targetName'), edge.data('description')]);
    const interactions = interactionEdges.map(pair =>
      `<li>${pair[0]}<ul><li>${pair[1]}</li></ul></li>`);

    // update HTML
    document.getElementById('nodeId').textContent = id;
    document.getElementById('nodeName').textContent = name;
    document.getElementById('nodeDescription').textContent = description;
    document.getElementById('nodeInteractions').innerHTML = `<ul>${interactions.join('')}</ul>`;

    // hide all elements except node info
    infoPlaceholder.classList.add('hidden');
    edgeInfo.classList.add('hidden');
    nodeInfo.classList.remove('hidden');
  } else if (element && element.isEdge()) {
    // Get info
    const description = element.data('description');
    const source = element.source().data('name');
    const target = element.target().data('name');

    // update HTML
    document.getElementById('edgeDescription').textContent = description;
    document.getElementById('edgeSource').textContent = source;
    document.getElementById('edgeTarget').textContent = target;

    // hide other elements
    infoPlaceholder.classList.add('hidden');
    nodeInfo.classList.add('hidden');
    edgeInfo.classList.remove('hidden');
  }
}

graph.on('tap', 'node, edge', async (event) => {
  graph.nodes().removeClass('highlight');
  const element = event.cyTarget;
  if (element.isNode() && element.outgoers().length === 0) {
    try {
      await addToGraph(element.id());
      populateInfo(graph.getElementById(`${element.id()}`));
    } catch (err) {
      console.log(err);
    }
  } else {
    // works for both nodes which already exist and for all edges (since edge source/ target will already exist)
    if (element.isEdge()) {
      // highlight source and target
      element.source().addClass('highlight');
      element.target().addClass('highlight');
    }
    populateInfo(element);
  }
});

document.getElementById('clear').addEventListener('click', () => {
  graph.remove();
});


/**
 * Search for a new drug. A search will clear the existing graph.
 * Results are displayed in a dropdown menu for selection.
 * @param {Event} e Event triggered by typing in search box
 */
function searchListener(e) {
  e.preventDefault();
  const searchText = e.target.value;
  console.log(searchText);
  // TODO: display search results in dropdown menu
  // TODO: selecting a search result should trigger onSubmit function
}
const searchBox = document.getElementById('drugSearchText');
const debouncedSearch = debounce(searchListener, 500);
searchBox.addEventListener('keydown', debouncedSearch);

/**
 * Submit the search results. Will also clear the existing graph.
 * @param {Event} e Event triggered when submit button is clicked
 */
function onSubmit(e) {
  // TODO: respond to the user input rather than always doing DB00001
  e.preventDefault();
  addToGraph('DB00001');
}
const submitButton = document.getElementById('drugSearchSubmit');
submitButton.addEventListener('click', onSubmit);
