// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
export type Identifiable = {
	_id: string
};

export type PartialButId<T extends Identifiable> = Partial<Omit<T, '_id'>> & Pick<T, '_id'>;
