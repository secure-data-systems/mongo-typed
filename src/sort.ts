import { DotNotation } from './dot-notation.js';

/** Sort specification: field paths mapped to sort direction or $meta */
export type ObjSort<TInput extends object> = {
	[K in DotNotation<TInput>]?: -1 | 1 | { $meta: string }
};
