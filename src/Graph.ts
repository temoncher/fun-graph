import {
  array,
  option,
  record,
} from 'fp-ts';
import { pipe, flow } from 'fp-ts/function';
import { lens } from 'monocle-ts';

import * as edge from './Edge';
import * as vertex from './Vertex';
import * as walk from './Walk';

// ESLint goes crazy on this line for some reason
// eslint-disable-next-line no-shadow
export enum AdjacencyType {
  NOT_ADJACENT = 0,
  ADJACENT = 1,
}

export type Path = [vertex.Vertex, ...vertex.Vertex[], vertex.Vertex];
export type AdjacencyMatrix = Record<vertex.Vertex, Record<vertex.Vertex, AdjacencyType>>;
export type AdjacencyList = Record<vertex.Vertex, vertex.Vertex[]>;
export type Graph = {
  _tag: 'Graph';
  _vertices: vertex.Vertex[];
  _edges: edge.Edge[];
};

type Empty = () => Graph;

export const empty: Empty = () => ({
  _tag: 'Graph',
  _vertices: [],
  _edges: [],
});

type FromVertices = (vertices: vertex.Vertex[]) => Graph;

export const fromVertices: FromVertices = (vertices) => ({
  _tag: 'Graph',
  _vertices: pipe(
    vertices,
    array.sort(vertex.Ord),
  ),
  _edges: [],
});

type FromEdges = (edges: edge.Edge[]) => Graph;

export const fromEdges: FromEdges = (edges: edge.Edge[]) => {
  const sortedVertices = pipe(
    edges,
    array.chain(([start, end]) => [start, end]),
    array.uniq(vertex.Eq),
    array.sort(vertex.Ord),
  );

  return {
    _tag: 'Graph',
    _vertices: sortedVertices,
    _edges: array.sort(edge.Ord)(edges),
  };
};

type FromAdjacencyMatrix = (adjacencyMatrix: AdjacencyMatrix) => Graph;

export const fromAdjacencyMatrix: FromAdjacencyMatrix = (adjacencyMatrix) => {
  const sortedVertices = pipe(
    adjacencyMatrix,
    Object.keys,
    array.sort(vertex.Ord),
  );

  const sortedEdges: edge.Edge[] = pipe(
    Object.entries(adjacencyMatrix),
    array.chain(([start, edgesToAdjacencyTypeMap]) => pipe(
      Object.entries(edgesToAdjacencyTypeMap),
      array.reduce<[vertex.Vertex, AdjacencyType], edge.Edge[]>([], (edgesSoFar, [end, adjacencyType]) => {
        if (adjacencyType === AdjacencyType.ADJACENT) return [...edgesSoFar, [start, end]];

        return edgesSoFar;
      }),
    )),
    array.sort(edge.Ord),
  );

  return {
    _tag: 'Graph',
    _vertices: sortedVertices,
    _edges: sortedEdges,
  };
};

type FromAdjacencyList = (adjacencyList: AdjacencyList) => Graph;

export const fromAdjacencyList: FromAdjacencyList = (adjacencyList) => {
  const sortedVertices = pipe(
    adjacencyList,
    Object.keys,
    array.sort(vertex.Ord),
  );
  const sortedEdges = pipe(
    Object.entries(adjacencyList),
    array.chain(([start, ends]) => pipe(
      ends,
      array.map((end) => [start, end] as edge.Edge),
    )),
    array.sort(edge.Ord),
  );

  return {
    _tag: 'Graph',
    _vertices: sortedVertices,
    _edges: sortedEdges,
  };
};

// eslint-disable-next-line @typescript-eslint/naming-convention
const _verticesLens = pipe(
  lens.id<Graph>(),
  lens.prop('_vertices'),
);

// eslint-disable-next-line @typescript-eslint/naming-convention
const _edgesLens = pipe(
  lens.id<Graph>(),
  lens.prop('_edges'),
);

type GetVertices = (graph: Graph) => vertex.Vertex[];

export const getVertices: GetVertices = _verticesLens.get;

type GetEdges = (graph: Graph) => edge.Edge[];

export const getEdges: GetEdges = _edgesLens.get;

type GetAdjacencyMatrix = (graph: Graph) => AdjacencyMatrix;

export const getAdjacencyMatrix: GetAdjacencyMatrix = (graph) => {
  const graphVertices = getVertices(graph);
  const graphEdges = getEdges(graph);

  const emptyMatrix: AdjacencyMatrix = Object.fromEntries(graphVertices.map((outerVertex) => {
    const matrixRow = graphVertices.map((innerVertex) => [innerVertex, AdjacencyType.NOT_ADJACENT] as const);

    return [outerVertex, Object.fromEntries(matrixRow)] as const;
  }));

  return pipe(
    graphEdges,
    array.reduce(emptyMatrix, (matrixSoFar, [start, end]) => pipe(
      matrixSoFar,
      record.modifyAt(start, flow(
        record.updateAt(end, AdjacencyType.ADJACENT),
        option.getOrElseW(() => {
          throw new Error('Didn\'t find corresponding vertex');
        }),
      )),
      option.getOrElseW(() => {
        throw new Error('Didn\'t find corresponding vertex');
      }),
    )),
  );
};

type GetAdjacencyList = (graph: Graph) => AdjacencyList;

export const getAdjacencyList: GetAdjacencyList = (graph) => {
  const graphVertices = getVertices(graph);
  const graphEdges = getEdges(graph);

  const emptyList: AdjacencyList = Object.fromEntries(graphVertices.map((graphVertex) => [graphVertex, []]));

  return pipe(
    graphEdges,
    array.reduce(emptyList, (adjacencyListSoFar, [start, end]) => pipe(
      adjacencyListSoFar,
      record.modifyAt(start, (currentEdgeAdjacentVertices) => [...currentEdgeAdjacentVertices, end]),
      option.getOrElseW(() => {
        throw new Error('Didn\'t find corresponding vertex');
      }),
    )),
  );
};

export type Neighborhood = vertex.Vertex[];

type GetNeighborhood = (vertexToFindNeighborsFor: vertex.Vertex) => (graph: Graph) => Neighborhood;

export const getClosedNeighborhood: GetNeighborhood = (vertexToFindNeighborsFor) => (graph) => {
  const edges = getEdges(graph);
  const emptyVertexList: vertex.Vertex[] = [];

  return pipe(
    edges,
    array.uniq(edge.Eq),
    array.reduce(emptyVertexList, (listOfVerticiesSoFar, [start, end]) => {
      if (vertex.Eq.equals(start, vertexToFindNeighborsFor)) return [...listOfVerticiesSoFar, end];

      if (vertex.Eq.equals(end, vertexToFindNeighborsFor)) return [...listOfVerticiesSoFar, start];

      return listOfVerticiesSoFar;
    }),
  );
};

export const getOpenNeighborhood: GetNeighborhood = (vertexToFindNeighborsFor) => (graph) => {
  const neighbors = getClosedNeighborhood(vertexToFindNeighborsFor)(graph);

  return neighbors.filter((neighbor) => !vertex.Eq.equals(neighbor, vertexToFindNeighborsFor));
};

/**
 * Alias for `getOpenNeighborhood`
 */
export const getNeighborhood = getOpenNeighborhood;

/**
 * Number of edges that are incident to the vertex.
 */
export type VertexDegree<V extends vertex.Vertex> = number;

type GetDegree = <V extends vertex.Vertex>(vertexToFindDegreeFor: V) => (graph: Graph) => VertexDegree<V>;

export const getDegree: GetDegree = (vertexToCalculateDegreeFor) => (graph) => {
  const edges = getEdges(graph);

  return pipe(
    edges,
    array.reduce(0, (degreeSoFar, [start, end]) => {
      const degreeToAdd = [start, end].filter((startOrEndVertex) => startOrEndVertex === vertexToCalculateDegreeFor).length;

      return degreeSoFar + degreeToAdd;
    }),
  );
};

type IsWalk = (graph: Graph) => (edgesToCheck: edge.Edge[]) => edgesToCheck is walk.Walk;

export const isWalk: IsWalk = (graph) => (edgesToCheck: edge.Edge[]): edgesToCheck is walk.Walk => {
  const graphEdges = getEdges(graph);
  const [firstEdgeToCheck, ...restEdges] = edgesToCheck;

  const [isWalkResult, lastEdge] = restEdges.reduce<[boolean, edge.Edge]>(([isWalkSoFar, previousEdge], currentEdge) => {
    if (!isWalkSoFar) return [false, currentEdge];

    const isPreviousEdgeConnectedToCurrent = previousEdge[1] === currentEdge[0];

    if (!isPreviousEdgeConnectedToCurrent) return [false, currentEdge];

    const isEdgePresentInTheGraph = !!graphEdges.find((graphEdge) => edge.Eq.equals(currentEdge, graphEdge));

    if (!isEdgePresentInTheGraph) return [false, currentEdge];

    return [true, currentEdge];
  }, [true, firstEdgeToCheck]);

  return isWalkResult;
};
