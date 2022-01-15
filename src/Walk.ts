import * as edge from './Edge';
import * as vertex from './Vertex';

/**
 * Sequence of edges which joins a sequence of vertices.
 * - Order matters!
 * - Every edge should be connected to the next one with vertex
 * - Edges are not distinct. Meaning, the same edge can be included multiple times.
 */
export type Walk<S extends vertex.Vertex = vertex.Vertex, E extends vertex.Vertex = vertex.Vertex> =
  | [singleEdge: edge.Edge<S, E>]
  | [start: edge.Edge<S>, ...rest: edge.Edge[], end: edge.Edge<vertex.Vertex, E>];
/**
  * A walk which starts and ends on the same vertex.
  */
export type ClosedWalk<S extends vertex.Vertex> = [edge.Edge<S>, ...edge.Edge[], edge.Edge<vertex.Vertex, S>];
export const isClosed = <S extends vertex.Vertex>(walk: Walk<S, vertex.Vertex>): walk is ClosedWalk<S> => {
  const [firstEdgeStart] = walk[0];
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [lastEdgeStart, lastEdgeEnd] = walk[walk.length - 1];

  return firstEdgeStart === lastEdgeEnd;
};
/**
  * A walk which starts and ends on different vertices.
  */
export type OpenWalk<S extends vertex.Vertex, E extends vertex.Vertex> = [edge.Edge<S>, ...edge.Edge[], edge.Edge<vertex.Vertex, E>];
export const isOpen = <S extends vertex.Vertex, E extends vertex.Vertex>(walk: Walk<S, E>): walk is OpenWalk<S, E> => !isClosed(walk);
