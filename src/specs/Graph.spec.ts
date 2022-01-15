import { option } from 'fp-ts';

import { graph } from '@/index';

describe('Graph', () => {
  test('empty', () => {
    // act
    const emptyGraph = graph.empty();

    // assert
    expect(graph.getVertices(emptyGraph)).toEqual([]);
    expect(graph.getEdges(emptyGraph)).toEqual([]);
  });

  test('from vertices', () => {
    // act
    const graphFromVertices = graph.fromVertices(['A', 'B', 'C']);

    // assert
    expect(graph.getVertices(graphFromVertices)).toEqual(['A', 'B', 'C']);
    expect(graph.getEdges(graphFromVertices)).toEqual([]);
  });

  test('from edges', () => {
    // act
    const graphFromEdges = graph.fromEdges([['A', 'B', 0], ['C', 'D', 0]]);

    // assert
    expect(graph.getVertices(graphFromEdges)).toEqual(['A', 'B', 'C', 'D']);
    expect(graph.getEdges(graphFromEdges)).toEqual([['A', 'B', 0], ['C', 'D', 0]]);
  });

  test('from adjacency matrix', () => {
    // act
    const graphFromAdjacencyMatrix = graph.fromAdjacencyMatrix({
      A: {
        A: option.none,
        B: option.some(1),
        C: option.some(2),
      },
      B: {
        A: option.some(2),
        B: option.none,
        C: option.some(1),
      },
      C: {
        A: option.none,
        B: option.none,
        C: option.none,
      },
    });

    // assert
    expect(graph.getVertices(graphFromAdjacencyMatrix)).toEqual(['A', 'B', 'C']);
    expect(graph.getEdges(graphFromAdjacencyMatrix)).toEqual([
      ['A', 'B', 1],
      ['A', 'C', 2],
      ['B', 'A', 2],
      ['B', 'C', 1],
    ]);
  });

  test('from adjacency list', () => {
    // act
    const graphFromAdjacencyList = graph.fromAdjacencyList({
      A: [['B', 1], ['C', 2]],
      B: [['A', 2], ['C', 1]],
      C: [],
    });

    // assert
    expect(graph.getVertices(graphFromAdjacencyList)).toEqual(['A', 'B', 'C']);
    expect(graph.getEdges(graphFromAdjacencyList)).toEqual([
      ['A', 'B', 1],
      ['A', 'C', 2],
      ['B', 'A', 2],
      ['B', 'C', 1],
    ]);
  });

  test('get adjacency matrix', () => {
    // arrange
    const graphFromEdges = graph.fromEdges([
      ['A', 'B', 1],
      ['B', 'C', 2],
      ['D', 'E', 2],
    ]);

    // act
    const adjacencyMatrix = graph.getAdjacencyMatrix(graphFromEdges);

    // assert
    expect(adjacencyMatrix).toEqual({
      A: {
        A: option.none,
        B: option.some(1),
        C: option.none,
        D: option.none,
        E: option.none,
      },
      B: {
        A: option.none,
        B: option.none,
        C: option.some(2),
        D: option.none,
        E: option.none,
      },
      C: {
        A: option.none,
        B: option.none,
        C: option.none,
        D: option.none,
        E: option.none,
      },
      D: {
        A: option.none,
        B: option.none,
        C: option.none,
        D: option.none,
        E: option.some(2),
      },
      E: {
        A: option.none,
        B: option.none,
        C: option.none,
        D: option.none,
        E: option.none,
      },
    });
  });

  test('get adjacency list', () => {
    // arrange
    const graphFromEdges = graph.fromEdges([
      ['A', 'B', 1],
      ['B', 'C', 2],
      ['D', 'E', 2],
    ]);

    // act
    const adjacencyList = graph.getAdjacencyList(graphFromEdges);

    // assert
    expect(adjacencyList).toEqual({
      A: [['B', 1]],
      B: [['C', 2]],
      C: [],
      D: [['E', 2]],
      E: [],
    });
  });

  test('get closed neighborhood', () => {
    // arrange
    const graphFromEdges = graph.fromEdges([
      ['A', 'B', 1],
      ['B', 'C', 2],
      ['B', 'B', 4],
      ['D', 'E', 2],
    ]);

    // act
    const bNeighbors = graph.getClosedNeighborhood('B')(graphFromEdges);

    // assert
    expect(bNeighbors).toEqual(['A', 'B', 'C']);
  });

  test('get open neighborhood', () => {
    // arrange
    const graphFromEdges = graph.fromEdges([
      ['A', 'B', 1],
      ['B', 'C', 2],
      ['B', 'B', 4],
      ['D', 'E', 2],
    ]);

    // act
    const bNeighbors = graph.getOpenNeighborhood('B')(graphFromEdges);

    // assert
    expect(bNeighbors).toEqual(['A', 'C']);
  });
});
