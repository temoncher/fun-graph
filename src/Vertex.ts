import { string } from 'fp-ts';

export type Vertex<V extends string = string> = V;
// eslint-disable-next-line prefer-destructuring
export const Eq = string.Eq;
// eslint-disable-next-line prefer-destructuring
export const Ord = string.Ord;
