import { vertex, edge, graph } from '@/index';

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
    const expectedVertices: vertex.Vertex[] = ['A', 'B', 'C'];
    const expectedEdges: edge.Edge[] = [];

    expect(graph.getVertices(graphFromVertices)).toEqual(expectedVertices);
    expect(graph.getEdges(graphFromVertices)).toEqual(expectedEdges);
  });

  test('from edges', () => {
    // act
    const graphFromEdges = graph.fromEdges([['A', 'B'], ['C', 'D']]);

    // assert
    const expectedVertices: vertex.Vertex[] = ['A', 'B', 'C', 'D'];
    const expectedEdges: edge.Edge[] = [['A', 'B'], ['C', 'D']];

    expect(graph.getVertices(graphFromEdges)).toEqual(expectedVertices);
    expect(graph.getEdges(graphFromEdges)).toEqual(expectedEdges);
  });

  test('from adjacency matrix', () => {
    // act
    const graphFromAdjacencyMatrix = graph.fromAdjacencyMatrix({
      A: {
        A: graph.AdjacencyType.NOT_ADJACENT,
        B: graph.AdjacencyType.ADJACENT,
        C: graph.AdjacencyType.ADJACENT,
      },
      B: {
        A: graph.AdjacencyType.ADJACENT,
        B: graph.AdjacencyType.NOT_ADJACENT,
        C: graph.AdjacencyType.ADJACENT,
      },
      C: {
        A: graph.AdjacencyType.NOT_ADJACENT,
        B: graph.AdjacencyType.NOT_ADJACENT,
        C: graph.AdjacencyType.NOT_ADJACENT,
      },
    });

    // assert
    const expectedVertices: vertex.Vertex[] = ['A', 'B', 'C'];
    const expectedEdges: edge.Edge[] = [
      ['A', 'B'],
      ['A', 'C'],
      ['B', 'A'],
      ['B', 'C'],
    ];

    expect(graph.getVertices(graphFromAdjacencyMatrix)).toEqual(expectedVertices);
    expect(graph.getEdges(graphFromAdjacencyMatrix)).toEqual(expectedEdges);
  });

  test('from adjacency list', () => {
    // act
    const graphFromAdjacencyList = graph.fromAdjacencyList({
      A: ['B', 'C'],
      B: ['A', 'C'],
      C: [],
    });

    // assert
    const expectedVertices: vertex.Vertex[] = ['A', 'B', 'C'];
    const expectedEdges: edge.Edge[] = [
      ['A', 'B'],
      ['A', 'C'],
      ['B', 'A'],
      ['B', 'C'],
    ];

    expect(graph.getVertices(graphFromAdjacencyList)).toEqual(expectedVertices);
    expect(graph.getEdges(graphFromAdjacencyList)).toEqual(expectedEdges);
  });

  test('get adjacency matrix', () => {
    // arrange
    const graphFromEdges = graph.fromEdges([
      ['A', 'B'],
      ['B', 'C'],
      ['D', 'E'],
    ]);

    // act
    const adjacencyMatrix = graph.getAdjacencyMatrix(graphFromEdges);

    // assert
    const expectedAdjacencyMatrix: graph.AdjacencyMatrix = {
      A: {
        A: graph.AdjacencyType.NOT_ADJACENT,
        B: graph.AdjacencyType.ADJACENT,
        C: graph.AdjacencyType.NOT_ADJACENT,
        D: graph.AdjacencyType.NOT_ADJACENT,
        E: graph.AdjacencyType.NOT_ADJACENT,
      },
      B: {
        A: graph.AdjacencyType.NOT_ADJACENT,
        B: graph.AdjacencyType.NOT_ADJACENT,
        C: graph.AdjacencyType.ADJACENT,
        D: graph.AdjacencyType.NOT_ADJACENT,
        E: graph.AdjacencyType.NOT_ADJACENT,
      },
      C: {
        A: graph.AdjacencyType.NOT_ADJACENT,
        B: graph.AdjacencyType.NOT_ADJACENT,
        C: graph.AdjacencyType.NOT_ADJACENT,
        D: graph.AdjacencyType.NOT_ADJACENT,
        E: graph.AdjacencyType.NOT_ADJACENT,
      },
      D: {
        A: graph.AdjacencyType.NOT_ADJACENT,
        B: graph.AdjacencyType.NOT_ADJACENT,
        C: graph.AdjacencyType.NOT_ADJACENT,
        D: graph.AdjacencyType.NOT_ADJACENT,
        E: graph.AdjacencyType.ADJACENT,
      },
      E: {
        A: graph.AdjacencyType.NOT_ADJACENT,
        B: graph.AdjacencyType.NOT_ADJACENT,
        C: graph.AdjacencyType.NOT_ADJACENT,
        D: graph.AdjacencyType.NOT_ADJACENT,
        E: graph.AdjacencyType.NOT_ADJACENT,
      },
    };

    expect(adjacencyMatrix).toEqual(expectedAdjacencyMatrix);
  });

  test('get adjacency list', () => {
    // arrange
    const graphFromEdges = graph.fromEdges([
      ['A', 'B'],
      ['B', 'C'],
      ['D', 'E'],
    ]);

    // act
    const adjacencyList = graph.getAdjacencyList(graphFromEdges);

    // assert
    const expectedAdjacencyList: graph.AdjacencyList = {
      A: ['B'],
      B: ['C'],
      C: [],
      D: ['E'],
      E: [],
    };

    expect(adjacencyList).toEqual(expectedAdjacencyList);
  });

  test('get closed neighborhood', () => {
    // arrange
    const graphFromEdges = graph.fromEdges([
      ['A', 'B'],
      ['B', 'C'],
      ['B', 'B'],
      ['D', 'E'],
    ]);

    // act
    const bNeighborhood = graph.getClosedNeighborhood('B')(graphFromEdges);

    // assert
    const expectedNeighborhood: graph.Neighborhood = ['A', 'B', 'C'];

    expect(bNeighborhood).toEqual(expectedNeighborhood);
  });

  test('get open neighborhood', () => {
    // arra
    const graphFromEdges = graph.fromEdges([
      ['A', 'B'],
      ['B', 'C'],
      ['B', 'B'],
      ['B', 'B'],
      ['D', 'E'],
    ]);

    // act
    const bNeighborhood = graph.getOpenNeighborhood('B')(graphFromEdges);

    // assert
    const expectedNeighborhood: graph.Neighborhood = ['A', 'C'];

    expect(bNeighborhood).toEqual(expectedNeighborhood);
  });

  test('get degree', () => {
    // arrange
    const graphFromEdges = graph.fromEdges([
      ['A', 'B'],
      ['B', 'C'],
      ['B', 'B'],
      ['B', 'B'],
      ['D', 'E'],
    ]);

    // act
    const bDegree = graph.getDegree('B')(graphFromEdges);

    // assert
    const expectedDegree: graph.VertexDegree<'B'> = 6;

    expect(bDegree).toEqual(expectedDegree);
  });

  test('is a walk for this graph', () => {
    // arrange
    const graphFromEdges = graph.fromEdges([
      ['A', 'B'],
      ['B', 'C'],
      ['B', 'B'],
      ['B', 'B'],
      ['D', 'E'],
    ]);
    const walkToCheck: edge.Edge[] = [
      ['A', 'B'],
      ['B', 'C'],
    ];

    // act
    const walkToCheckIsWalkForTheGraph = graph.isWalk(graphFromEdges)(walkToCheck);

    // assert
    expect(walkToCheckIsWalkForTheGraph).toBe(true);
  });

  test('is not a walk for this graph', () => {
    // arrange
    const graphFromEdges = graph.fromEdges([
      ['A', 'B'],
      ['B', 'C'],
      ['B', 'B'],
      ['B', 'B'],
      ['D', 'E'],
    ]);
    const walkToCheck: edge.Edge[] = [
      ['A', 'B'],
      ['B', 'C'],
      ['C', 'D'],
    ];

    // act
    const walkToCheckIsWalkForTheGraph = graph.isWalk(graphFromEdges)(walkToCheck);

    // assert
    expect(walkToCheckIsWalkForTheGraph).toBe(false);
  });
});
