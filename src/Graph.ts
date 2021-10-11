import * as A from 'fp-ts/lib/Array';
import * as O from 'fp-ts/lib/Option';
import * as Ord from 'fp-ts/lib/Ord';
import * as R from 'fp-ts/lib/Record';
import * as F from 'fp-ts/lib/function';
import * as N from 'fp-ts/lib/number';
import * as S from 'fp-ts/lib/string';
import { lens } from 'monocle-ts';

export type Vertex = string;
export type Weight = number;
export type Edge = [start: Vertex, end: Vertex, weight: Weight];
export type AdjacencyMatrix = Record<Vertex, Record<Vertex, O.Option<Weight>>>;
export type AdjacencyList = Record<Vertex, [end: Vertex, weight: Weight][]>;
export type Graph = {
  _tag: 'Graph';
  _vertices: Vertex[];
  _edges: Edge[];
};

export namespace Graph {
  type Empty = () => Graph;
  export const empty: Empty = () => ({
    _tag: 'Graph',
    _vertices: [],
    _edges: [],
  });

  // eslint-disable-next-line @typescript-eslint/naming-convention
  const _sortVertices = A.sort(S.Ord);
  // eslint-disable-next-line @typescript-eslint/naming-convention
  const _sortEdges = A.sort(
    Ord.fromCompare<Edge>(([start1, end1, weight1], [start2, end2, weight2]) => {
      const startOrdering = S.Ord.compare(start1, start2);

      if (startOrdering !== 0) return startOrdering;

      const endOrdering = S.Ord.compare(end1, end2);

      if (endOrdering !== 0) return endOrdering;

      const weightOrdering = N.Ord.compare(weight1, weight2);

      return weightOrdering;
    }),
  );

  type FromVertices = (vertices: Vertex[]) => Graph;
  export const fromVertices: FromVertices = (vertices) => ({
    _tag: 'Graph',
    _vertices: _sortVertices(vertices),
    _edges: [],
  });

  type FromEdges = (edges: Edge[]) => Graph;
  export const fromEdges: FromEdges = (edges) => {
    const sortedVertices = F.pipe(
      edges,
      A.chain(([start, end, weight]) => [start, end]),
      A.uniq(S.Eq),
      _sortVertices,
    );

    return {
      _tag: 'Graph',
      _vertices: sortedVertices,
      _edges: _sortEdges(edges),
    };
  };

  type FromAdjacencyMatrix = (adjacencyMatrix: AdjacencyMatrix) => Graph;
  export const fromAdjacencyMatrix: FromAdjacencyMatrix = (adjacencyMatrix) => {
    const sortedVertices = F.pipe(
      adjacencyMatrix,
      Object.keys,
      _sortVertices,
    );
    const sortedEdges: Edge[] = F.pipe(
      Object.entries(adjacencyMatrix),
      A.chain(([start, edgesToWeightsMap]) => F.pipe(
        Object.entries(edgesToWeightsMap),
        A.map<[string, O.Option<number>], O.Option<Edge>>(([end, weightOption]) => F.pipe(
          weightOption,
          O.map((weight) => [start, end, weight]),
        )),
        A.filter(O.isSome),
        A.map((edgeSome) => edgeSome.value),
      )),
      _sortEdges,
    );

    return {
      _tag: 'Graph',
      _vertices: sortedVertices,
      _edges: sortedEdges,
    };
  };

  type FromAdjacencyList = (adjacencyList: AdjacencyList) => Graph;
  export const fromAdjacencyList: FromAdjacencyList = (adjacencyList) => {
    const sortedVertices = F.pipe(
      adjacencyList,
      Object.keys,
      _sortVertices,
    );
    const sortedEdges = F.pipe(
      Object.entries(adjacencyList),
      A.chain(([start, endsAndWeights]) => F.pipe(
        endsAndWeights,
        A.map<[string, number], Edge>(([end, weight]) => [start, end, weight]),
      )),
      _sortEdges,
    );

    return {
      _tag: 'Graph',
      _vertices: sortedVertices,
      _edges: sortedEdges,
    };
  };

  // eslint-disable-next-line @typescript-eslint/naming-convention
  const _verticesLens = F.pipe(
    lens.id<Graph>(),
    lens.prop('_vertices'),
  );

  // eslint-disable-next-line @typescript-eslint/naming-convention
  const _edgesLens = F.pipe(
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
      const matrixRow = vertices.map((innerVertex) => [innerVertex, O.none] as const);

      return [outerVertex, Object.fromEntries(matrixRow)] as const;
    }));

    return F.pipe(
      edges,
      A.reduce(emptyMatrix, (matrixSoFar, [start, end, weight]) => F.pipe(
        matrixSoFar,
        R.modifyAt(start, F.flow(
          R.updateAt(end, O.some(weight)),
          O.getOrElseW(() => {
            throw new Error('Didn\'t find corresponding vertex');
          }),
        )),
        O.getOrElseW(() => {
          throw new Error('Didn\'t find corresponding vertex');
        }),
      )),
    );
  };

  type GetAdjacencyList = (graph: Graph) => AdjacencyList;
  export const getAdjacencyList: GetAdjacencyList = (graph) => {
    const vertices = getVertices(graph);
    const edges = getEdges(graph);
    const emptyList = Object.fromEntries(vertices.map<[Vertex, [Vertex, Weight][]]>((vertex) => [vertex, []]));

    return F.pipe(
      edges,
      A.reduce(emptyList, (adjacencyListSoFar, [start, end, weight]) => F.pipe(
        adjacencyListSoFar,
        R.modifyAt(start, (currentEdgeAdjacentVerticesWithWeights) => F.pipe(
          currentEdgeAdjacentVerticesWithWeights,
          A.append<[Vertex, Weight]>([end, weight]),
        )),
        O.getOrElseW(() => {
          throw new Error('Didn\'t find corresponding vertex');
        }),
      )),
    );
  };
}
