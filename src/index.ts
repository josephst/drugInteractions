declare const cytoscape: any;
import * as axios from 'axios';

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

type Element = INode | IEdge;

const graph = cytoscape({
  container: document.getElementById('cy'),
});

let nodes: INode[] = [];
let edges: IEdge[] = [];
axios.get('/data/nodes-small.json')
  .then((response) => {
    nodes = <INode[]> response.data;
    graph.add(nodes);
    axios.get('/data/edges-small.json')
      .then((response) => {
        edges = <IEdge[]> response.data;
        graph.add(edges);
        graph.layout({ name: 'grid' });
      });
  })
  .catch((err) => console.log(err));
