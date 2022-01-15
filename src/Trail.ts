import { array } from 'fp-ts';

import * as edge from './Edge';
import * as vertex from './Vertex';
import * as walk from './Walk';

/**
 * A walk in which edges are not repeated
 */
export type Trail<S extends vertex.Vertex = vertex.Vertex, E extends vertex.Vertex = vertex.Vertex> =
 | [singleEdge: edge.Edge<S, E>]
 | [start: edge.Edge<S>, ...rest: edge.Edge[], end: edge.Edge<vertex.Vertex, E>];
export const isTrail = <S extends vertex.Vertex, E extends vertex.Vertex>(walkToCheck: walk.Walk<S, E>): walkToCheck is Trail<S, E> => {
  const uniqueEdges = array.uniq(edge.Eq)(walkToCheck);

  return walkToCheck.length === uniqueEdges.length;
};
