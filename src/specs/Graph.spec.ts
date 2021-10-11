import * as O from 'fp-ts/lib/Option';

import { Graph } from '@/Graph';

describe('Graph', () => {
  test('empty', () => {
    // act
    const graph = Graph.empty();

    // assert
    expect(Graph.getVertices(graph)).toEqual([]);
    expect(Graph.getEdges(graph)).toEqual([]);
  });

  test('from vertices', () => {
    // act
    const graph = Graph.fromVertices(['A', 'B', 'C']);

    // assert
    expect(Graph.getVertices(graph)).toEqual(['A', 'B', 'C']);
    expect(Graph.getEdges(graph)).toEqual([]);
  });

  test('from edges', () => {
    // act
    const graph = Graph.fromEdges([['A', 'B', 0], ['C', 'D', 0]]);

    // assert
    expect(Graph.getVertices(graph)).toEqual(['A', 'B', 'C', 'D']);
    expect(Graph.getEdges(graph)).toEqual([['A', 'B', 0], ['C', 'D', 0]]);
  });

  test('from adjacency matrix', () => {
    // act
    const graph = Graph.fromAdjacencyMatrix({
      A: {
        A: O.none,
        B: O.some(1),
        C: O.some(2),
      },
      B: {
        A: O.some(2),
        B: O.none,
        C: O.some(1),
      },
      C: {
        A: O.none,
        B: O.none,
        C: O.none,
      },
    });

    // assert
    expect(Graph.getVertices(graph)).toEqual(['A', 'B', 'C']);
    expect(Graph.getEdges(graph)).toEqual([
      ['A', 'B', 1],
      ['A', 'C', 2],
      ['B', 'A', 2],
      ['B', 'C', 1],
    ]);
  });

  test('from adjacency list', () => {
    // act
    const graph = Graph.fromAdjacencyList({
      A: [['B', 1], ['C', 2]],
      B: [['A', 2], ['C', 1]],
      C: [],
    });

    // assert
    expect(Graph.getVertices(graph)).toEqual(['A', 'B', 'C']);
    expect(Graph.getEdges(graph)).toEqual([
      ['A', 'B', 1],
      ['A', 'C', 2],
      ['B', 'A', 2],
      ['B', 'C', 1],
    ]);
  });

  test('get adjacency matrix', () => {
    // arrange
    const graph = Graph.fromEdges([
      ['A', 'B', 1],
      ['B', 'C', 2],
      ['D', 'E', 2],
    ]);

    // act
    const adjacencyMatrix = Graph.getAdjacencyMatrix(graph);

    // assert
    expect(adjacencyMatrix).toEqual({
      A: {
        A: O.none,
        B: O.some(1),
        C: O.none,
        D: O.none,
        E: O.none,
      },
      B: {
        A: O.none,
        B: O.none,
        C: O.some(2),
        D: O.none,
        E: O.none,
      },
      C: {
        A: O.none,
        B: O.none,
        C: O.none,
        D: O.none,
        E: O.none,
      },
      D: {
        A: O.none,
        B: O.none,
        C: O.none,
        D: O.none,
        E: O.some(2),
      },
      E: {
        A: O.none,
        B: O.none,
        C: O.none,
        D: O.none,
        E: O.none,
      },
    });
  });

  test('get adjacency list', () => {
    // arrange
    const graph = Graph.fromEdges([
      ['A', 'B', 1],
      ['B', 'C', 2],
      ['D', 'E', 2],
    ]);

    // act
    const adjacencyList = Graph.getAdjacencyList(graph);

    // assert
    expect(adjacencyList).toEqual({
      A: [['B', 1]],
      B: [['C', 2]],
      C: [],
      D: [['E', 2]],
      E: [],
    });
  });
});
