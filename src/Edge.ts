import { eq, ord } from 'fp-ts';

import * as vertex from './Vertex';

/**
 * A connection between two vertices in a graph
 */
export type Edge<S extends vertex.Vertex = vertex.Vertex, E extends vertex.Vertex = vertex.Vertex> = [start: S, end: E];
export const Eq = eq.fromEquals<Edge>(([start1, end1], [start2, end2]) => {
  const areCompletelyEqual = vertex.Eq.equals(start1, start2) && vertex.Eq.equals(end1, end2);
  const reversed = vertex.Eq.equals(start1, end2) && vertex.Eq.equals(start2, end1);

  return areCompletelyEqual || reversed;
});
export const Ord = ord.fromCompare<Edge>((edge1, edge2) => {
  if (Eq.equals(edge1, edge2)) return 0;

  const [start1, end1] = edge1;
  const [start2, end2] = edge2;

  const startsCompareResult = vertex.Ord.compare(start1, start2);

  if (startsCompareResult !== 0) return startsCompareResult;

  return vertex.Ord.compare(end1, end2);
});
