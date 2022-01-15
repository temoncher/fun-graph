import {
  array,
  option,
  ord,
  record,
  string,
} from 'fp-ts';
import { pipe, flow } from 'fp-ts/function';
import { lens } from 'monocle-ts';

import {
  Vertex,
  Edge,
  eqByStartEndPair,
  Degree,
} from './Edge';

// ESLint goes crazy on this line for some reason
// eslint-disable-next-line no-shadow
export enum AdjacencyType {
  NOT_ADJACENT = 0,
  ADJACENT = 1,
}

export type Path = [Vertex, ...Vertex[], Vertex];
export type AdjacencyMatrix = Record<Vertex, Record<Vertex, AdjacencyType>>;
export type AdjacencyList = Record<Vertex, Vertex[]>;
export type Graph = {
  _tag: 'Graph';
  _vertices: Vertex[];
  _edges: Edge[];
};

type Empty = () => Graph;

export const empty: Empty = () => ({
  _tag: 'Graph',
  _vertices: [],
  _edges: [],
});

// eslint-disable-next-line @typescript-eslint/naming-convention
const _sortByValue = array.sort(string.Ord);
// eslint-disable-next-line @typescript-eslint/naming-convention
const _sortByStartThenEnd = array.sort(
  ord.fromCompare<Edge>(([start1, end1], [start2, end2]) => {
    const startOrdering = string.Ord.compare(start1, start2);

    if (startOrdering !== 0) return startOrdering;

    const endOrdering = string.Ord.compare(end1, end2);

    return endOrdering;
  }),
);

type FromVertices = (vertices: Vertex[]) => Graph;

export const fromVertices: FromVertices = (vertices) => ({
  _tag: 'Graph',
  _vertices: _sortByValue(vertices),
  _edges: [],
});

type FromEdges = (edges: Edge[]) => Graph;

export const fromEdges: FromEdges = (edges) => {
  const sortedVertices = pipe(
    edges,
    array.chain(([start, end]) => [start, end]),
    array.uniq(string.Eq),
    _sortByValue,
  );

  return {
    _tag: 'Graph',
    _vertices: sortedVertices,
    _edges: _sortByStartThenEnd(edges),
  };
};

type FromAdjacencyMatrix = (adjacencyMatrix: AdjacencyMatrix) => Graph;

export const fromAdjacencyMatrix: FromAdjacencyMatrix = (adjacencyMatrix) => {
  const sortedVertices = pipe(
    adjacencyMatrix,
    Object.keys,
    _sortByValue,
  );

  const sortedEdges: Edge[] = pipe(
    Object.entries(adjacencyMatrix),
    array.chain(([start, edgesToAdjacencyTypeMap]) => pipe(
      Object.entries(edgesToAdjacencyTypeMap),
      array.reduce<[Vertex, AdjacencyType], Edge[]>([], (edgesSoFar, [end, adjacencyType]) => {
        if (adjacencyType === AdjacencyType.ADJACENT) return [...edgesSoFar, [start, end]];

        return edgesSoFar;
      }),
    )),
    _sortByStartThenEnd,
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
    _sortByValue,
  );
  const sortedEdges = pipe(
    Object.entries(adjacencyList),
    array.chain(([start, ends]) => pipe(
      ends,
      array.map((end) => [start, end] as Edge),
    )),
    _sortByStartThenEnd,
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

type GetVertices = (graph: Graph) => Vertex[];

export const getVertices: GetVertices = _verticesLens.get;

type GetEdges = (graph: Graph) => Edge[];

export const getEdges: GetEdges = _edgesLens.get;

type GetAdjacencyMatrix = (graph: Graph) => AdjacencyMatrix;

export const getAdjacencyMatrix: GetAdjacencyMatrix = (graph) => {
  const vertices = getVertices(graph);
  const edges = getEdges(graph);

  const emptyMatrix: AdjacencyMatrix = Object.fromEntries(vertices.map((outerVertex) => {
    const matrixRow = vertices.map((innerVertex) => [innerVertex, AdjacencyType.NOT_ADJACENT] as const);

    return [outerVertex, Object.fromEntries(matrixRow)] as const;
  }));

  return pipe(
    edges,
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
  const vertices = getVertices(graph);
  const edges = getEdges(graph);

  const emptyList: AdjacencyList = Object.fromEntries(vertices.map((vertex) => [vertex, []]));

  return pipe(
    edges,
    array.reduce(emptyList, (adjacencyListSoFar, [start, end]) => pipe(
      adjacencyListSoFar,
      record.modifyAt(start, (currentEdgeAdjacentVertices) => [...currentEdgeAdjacentVertices, end]),
      option.getOrElseW(() => {
        throw new Error('Didn\'t find corresponding vertex');
      }),
    )),
  );
};

export type Neighborhood = Vertex[];

type GetNeighborhood = (vertex: Vertex) => (graph: Graph) => Neighborhood;

export const getClosedNeighborhood: GetNeighborhood = (vertexToFindNeighborsFor) => (graph) => {
  const edges = getEdges(graph);
  const emptyVertexList: Vertex[] = [];

  return pipe(
    edges,
    array.uniq(eqByStartEndPair),
    array.reduce(emptyVertexList, (listOfVerticiesSoFar, [start, end]) => {
      // TODO: vertex.Eq?
      if (start === vertexToFindNeighborsFor) return [...listOfVerticiesSoFar, end];

      if (end === vertexToFindNeighborsFor) return [...listOfVerticiesSoFar, start];

      return listOfVerticiesSoFar;
    }),
  );
};

export const getOpenNeighborhood: GetNeighborhood = (vertexToFindNeighborsFor) => (graph) => {
  const neighbors = getClosedNeighborhood(vertexToFindNeighborsFor)(graph);

  return neighbors.filter((neighbor) => neighbor !== vertexToFindNeighborsFor);
};

/**
 * Alias for `getOpenNeighborhood`
 */
export const getNeighborhood = getOpenNeighborhood;

type GetDegree = <V extends Vertex>(vertex: V) => (graph: Graph) => Degree<V>;

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
