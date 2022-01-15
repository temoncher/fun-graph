import {
  array,
  option,
  ord,
  record,
  number,
  string,
} from 'fp-ts';
import { pipe, flow } from 'fp-ts/function';
import { lens } from 'monocle-ts';

export type Vertex = string;
export type Weight = number;
export type Edge = [start: Vertex, end: Vertex, weight: Weight];
export type AdjacencyMatrix = Record<Vertex, Record<Vertex, option.Option<Weight>>>;
export type AdjacencyList = Record<Vertex, [end: Vertex, weight: Weight][]>;
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
const _sortByStartEndThenWeight = array.sort(
  ord.fromCompare<Edge>(([start1, end1, weight1], [start2, end2, weight2]) => {
    const startOrdering = string.Ord.compare(start1, start2);

    if (startOrdering !== 0) return startOrdering;

    const endOrdering = string.Ord.compare(end1, end2);

    if (endOrdering !== 0) return endOrdering;

    const weightOrdering = number.Ord.compare(weight1, weight2);

    return weightOrdering;
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
    array.chain(([start, end, weight]) => [start, end]),
    array.uniq(string.Eq),
    _sortByValue,
  );

  return {
    _tag: 'Graph',
    _vertices: sortedVertices,
    _edges: _sortByStartEndThenWeight(edges),
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
    array.chain(([start, edgesToWeightsMap]) => pipe(
      Object.entries(edgesToWeightsMap),
      array.map<[string, option.Option<number>], option.Option<Edge>>(([end, weightOption]) => pipe(
        weightOption,
        option.map((weight) => [start, end, weight]),
      )),
      array.filter(option.isSome),
      array.map((edgeSome) => edgeSome.value),
    )),
    _sortByStartEndThenWeight,
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
    array.chain(([start, endsAndWeights]) => pipe(
      endsAndWeights,
      array.map<[string, number], Edge>(([end, weight]) => [start, end, weight]),
    )),
    _sortByStartEndThenWeight,
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
    const matrixRow = vertices.map((innerVertex) => [innerVertex, option.none] as const);

    return [outerVertex, Object.fromEntries(matrixRow)] as const;
  }));

  return pipe(
    edges,
    array.reduce(emptyMatrix, (matrixSoFar, [start, end, weight]) => pipe(
      matrixSoFar,
      record.modifyAt(start, flow(
        record.updateAt(end, option.some(weight)),
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
    array.reduce(emptyList, (adjacencyListSoFar, [start, end, weight]) => pipe(
      adjacencyListSoFar,
      record.modifyAt(start, (currentEdgeAdjacentVerticesWithWeights) => pipe(
        // can not be reduced to `flow` because array.append returns NonEmptyArray
        currentEdgeAdjacentVerticesWithWeights,
        array.append<[Vertex, Weight]>([end, weight]),
      )),
      option.getOrElseW(() => {
        throw new Error('Didn\'t find corresponding vertex');
      }),
    )),
  );
};

type GetNeighbors = (vertex: Vertex) => (graph: Graph) => Vertex[];

export const getClosedNeighborhood: GetNeighbors = (vertexToFindNeighborsFor) => (graph) => {
  const edges = getEdges(graph);
  const emptyVertexList: Vertex[] = [];

  return pipe(
    edges,
    array.reduce(emptyVertexList, (listOfVerticiesSoFar, [start, end]) => {
      // TODO: vertex.Eq?
      if (start === vertexToFindNeighborsFor) return [...listOfVerticiesSoFar, end];

      if (end === vertexToFindNeighborsFor) return [...listOfVerticiesSoFar, start];

      return listOfVerticiesSoFar;
    }),
  );
};

export const getNeighborhood: GetNeighbors = (vertexToFindNeighborsFor) => (graph) => {
  const neighbors = getClosedNeighborhood(vertexToFindNeighborsFor)(graph);

  return neighbors.filter((neighbor) => neighbor !== vertexToFindNeighborsFor);
};
