import { eq } from 'fp-ts';

export type Vertex<V extends string = string> = V;
/**
 * Number of edges that are incident to the vertex.
 */
export type Degree<V extends Vertex> = number;
/**
 * A connection between two vertices in a graph
 */
export type Edge<S extends Vertex = Vertex, E extends Vertex = Vertex> = [start: S, end: E];
export const eqByStartEndPair: eq.Eq<Edge> = {
  equals: ([start1, end1], [start2, end2]) => start1 === start2 && end1 === end2,
};
