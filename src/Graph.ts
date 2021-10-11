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
export type Graph = {
  _tag: 'Graph';
  _verticies: Vertex[];
  _edges: Edge[];
};

export namespace Graph {
  type Empty = () => Graph;
  export const empty: Empty = () => ({
    _tag: 'Graph',
    _verticies: [],
    _edges: [],
  });

  // eslint-disable-next-line @typescript-eslint/naming-convention
  const _sortVerticies = A.sort(S.Ord);
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

  type FromVerticies = (verticies: Vertex[]) => Graph;
  export const fromVerticies: FromVerticies = (verticies) => ({
    _tag: 'Graph',
    _verticies: _sortVerticies(verticies),
    _edges: [],
  });

  type FromEdges = (edges: Edge[]) => Graph;
  export const fromEdges: FromEdges = (edges) => {
    const sortedVerticies = F.pipe(
      edges,
      A.chain(([start, end, weight]) => [start, end]),
      A.uniq(S.Eq),
      _sortVerticies,
    );

    return {
      _tag: 'Graph',
      _verticies: sortedVerticies,
      _edges: _sortEdges(edges),
    };
  };

  type FromAdjacencyMatrix = (adjacencyMatrix: AdjacencyMatrix) => Graph;
  export const fromAdjacencyMatrix: FromAdjacencyMatrix = (adjacencyMatrix) => {
    const verticies = F.pipe(
      adjacencyMatrix,
      Object.keys,
      _sortVerticies,
    );
    const edges: Edge[] = F.pipe(
      Object.entries(adjacencyMatrix),
      A.chain(([start, currentEdges]) => F.pipe(
        Object.entries(currentEdges),
        A.map<[string, O.Option<number>], O.Option<Edge>>(([end, weightOption]) => F.pipe(
          weightOption,
          O.map((weight) => [start, end, weight]),
        )),
        A.filter(O.isSome),
        A.map((edgeSome) => edgeSome.value),
      )),
    );

    return {
      _tag: 'Graph',
      _verticies: verticies,
      _edges: edges,
    };
  };

  // eslint-disable-next-line @typescript-eslint/naming-convention
  const _verticiesLens = F.pipe(
    lens.id<Graph>(),
    lens.prop('_verticies'),
  );

  // eslint-disable-next-line @typescript-eslint/naming-convention
  const _edgesLens = F.pipe(
    lens.id<Graph>(),
    lens.prop('_edges'),
  );

  type GetVerticies = (graph: Graph) => Vertex[];
  export const getVerticies: GetVerticies = _verticiesLens.get;

  type GetEdges = (graph: Graph) => Edge[];
  export const getEdges: GetEdges = _edgesLens.get;

  type GetAdjacencyMatrix = (graph: Graph) => AdjacencyMatrix;
  export const getAdjacencyMatrix: GetAdjacencyMatrix = (graph) => {
    const vertices = getVerticies(graph);
    const edges = getEdges(graph);
    const emptyMatrix: AdjacencyMatrix = Object.fromEntries(vertices.map((outerVertex) => {
      const matrixRow = vertices.map((innerVertex) => [innerVertex, O.none] as const);

      return [outerVertex, Object.fromEntries(matrixRow)] as const;
    }));

    return edges.reduce<AdjacencyMatrix>((matrixSoFar, [start, end, weight]) => F.pipe(
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
    ), emptyMatrix);
  };
}
