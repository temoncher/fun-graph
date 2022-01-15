import { Edge, Vertex } from './Edge';

/**
 * Sequence of edges which joins a sequence of vertices.
 * - Order matters!
 * - Every edge should be connected to the next one with vertex
 * - Edges are not distinct. Meaning, the same edge can be included multiple times.
 */
export type Walk<S extends Vertex, E extends Vertex> = [singleEdge: Edge<S, E>] | [start: Edge<S>, ...rest: Edge[], end: Edge<Vertex, E>];
/**
  * A walk which starts and ends on the same vertex.
  */
export type ClosedWalk<S extends Vertex> = [Edge<S>, ...Edge[], Edge<Vertex, S>];
export const isClosed = <S extends Vertex>(walk: Walk<S, Vertex>): walk is ClosedWalk<S> => {
  const [firstEdgeStart] = walk[0];
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [lastEdgeStart, lastEdgeEnd] = walk[walk.length - 1];

  return firstEdgeStart === lastEdgeEnd;
};
/**
  * A walk which starts and ends on different vertices.
  */
export type OpenWalk<S extends Vertex, E extends Vertex> = [Edge<S>, ...Edge[], Edge<Vertex, E>];
export const isOpen = <S extends Vertex, E extends Vertex>(walk: Walk<S, E>): walk is OpenWalk<S, E> => {
  const [firstEdgeStart] = walk[0];
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [lastEdgeStart, lastEdgeEnd] = walk[walk.length - 1];

  return firstEdgeStart !== lastEdgeEnd;
};
