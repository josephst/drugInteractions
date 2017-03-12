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
  ],
});
window.cy = graph;

const layoutOptions = {
  name: 'random',
};

const apiPath = 'http://druginteractions.azurewebsites.net/apiV1/drugs';

async function getData(drugId) {
  const drug = await axios.get(`${apiPath}/id/${drugId}`);
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
  if (res.status >= 200 && res.status < 300) {
    const drug = res.data;
    if (graph.getElementById(drug.drugbankId).length === 0) {
      addNode(drug.drugbankId, drug.name, drug.description);
    }
    if (drug.interactions.length > 0) {
      addEdges(drug.drugbankId, drug.interactions);
    }
    redoLayout();
  } else {
    console.log('not found');
    // TODO: display error that node was not found
  }
}

graph.on('tap', 'node', (event) => {
  console.log(`clicked on ${event.cyTarget.id()}`);
  addToGraph(event.cyTarget.id());
  // TODO: Get description (if not already existing) and interactions for clicked node.
  // TODO: Populate info box with clicked drug's info
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
