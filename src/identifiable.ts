import { DeepPartial } from './types.js';

export type DeepPartialButId<T extends Identifiable> = DeepPartial<Omit<T, '_id'>> & Pick<T, '_id'>;

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
export type Identifiable = {
	_id: string
};

export type PartialButId<T extends Identifiable> = Partial<Omit<T, '_id'>> & Pick<T, '_id'>;
