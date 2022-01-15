import { edge } from '@/index';

describe('Edge', () => {
  test('are equal', () => {
    // arrange
    const edge1: edge.Edge = ['A', 'B'];
    const edge2: edge.Edge = ['B', 'A'];

    // act
    const edgesAreEqual = edge.Eq.equals(edge1, edge2);

    // assert
    expect(edgesAreEqual).toBe(true);
  });

  test('are not equal', () => {
    // arrange
    const edge1: edge.Edge = ['A', 'B'];
    const edge2: edge.Edge = ['A', 'C'];

    // act
    const edgesAreEqual = edge.Eq.equals(edge1, edge2);

    // assert
    expect(edgesAreEqual).toBe(false);
  });

  test('greater', () => {
    // arrange
    const edge1: edge.Edge = ['A', 'B'];
    const edge2: edge.Edge = ['A', 'C'];

    // act
    const compareResult = edge.Ord.compare(edge1, edge2);

    // assert
    expect(compareResult).toBe(-1);
  });

  test('lesser', () => {
    // arrange
    const edge1: edge.Edge = ['A', 'C'];
    const edge2: edge.Edge = ['A', 'B'];

    // act
    const compareResult = edge.Ord.compare(edge1, edge2);

    // assert
    expect(compareResult).toBe(1);
  });
});
