# mongo-typed

TypeScript utility types for building strongly-typed MongoDB filters, updates, and aggregation pipelines — without adding dependencies.

## Overview

`mongo-typed` provides type-safe MongoDB-style query, update, and aggregation utilities in TypeScript. It is designed to assist with building fully-typed data repository layers or services that interact with MongoDB-like syntax, without relying on external libraries or runtime packages.

Whether you're working with an actual MongoDB database or implementing similar patterns in your application logic, `mongo-typed` gives you strong typing for common Mongo operations like filters, updates, and aggregation pipelines.

## Features

- Fully typed **filter** support (including `$and`, `$or`, `$in`, `$elemMatch`, etc.)
- Strongly typed **update** operations (e.g., `$set`, `$inc`, `$unset`, etc.)
- Fluent **aggregation pipeline** builder with schema tracking across stages
- Fluent **find** and **findById** builders with type-safe projections
- No dependencies — pure TypeScript
- Helps catch invalid Mongo-like queries at compile time

## Installation

```bash
pnpm add mongo-typed
# or
npm install mongo-typed
# or
yarn add mongo-typed
```

## Usage

### Filter

```ts
import { Filter } from 'mongo-typed';

type User = {
  _id: string;
  email: string;
  age: number;
  roles: string[];
};

const query: Filter<User> = {
  age: { $gte: 18 },
  roles: { $in: ['admin', 'user'] },
  $or: [
    { email: /@example\.com$/ },
    { email: { $exists: false } }
  ]
};
```

### Update

```ts
import { Update } from 'mongo-typed';

const update: Update<User> = {
  $set: {
    email: 'new@email.com'
  },
  $inc: {
    age: 1
  },
  $unset: {
    roles: true
  }
};
```

### Aggregation Pipeline

The `pipeline()` function returns a fluent builder that tracks the document schema as it flows through each stage. The output type updates automatically — `$group` reshapes the schema, `$unwind` flattens arrays, `$project` picks or excludes fields, and so on.

```ts
import { pipeline } from 'mongo-typed';

type User = {
  _id: string;
  department: string;
  salary: number;
  active: boolean;
};

const stages = pipeline<User>()
  .match({ active: true })
  .group({ _id: '$department', headcount: { $sum: 1 } })
  .sort({ headcount: -1 })
  .build();
// stages: [{ $match: ... }, { $group: ... }, { $sort: ... }]
```

Supported stages: `$addFields`, `$count`, `$facet`, `$group`, `$limit`, `$lookup`, `$match`, `$merge`, `$out`, `$project`, `$replaceRoot`, `$replaceWith`, `$sample`, `$set`, `$setWindowFields`, `$skip`, `$sort`, `$sortByCount`, `$unset`, `$unwind`.

### Find Builder

`FindBuilder` provides a fluent, type-safe interface for MongoDB find queries. It tracks the document schema through projections — `select()` reshapes the output type while `where()` and `sort()` validate against the input schema.

```ts
import { FindBuilder, FindOptions } from 'mongo-typed';

type User = {
  _id: string;
  name: string;
  email: string;
  age: number;
  active: boolean;
};

// Subclass to connect to your database
class MyFind<TInput extends object, TOutput extends object = TInput>
  extends FindBuilder<TInput, TOutput, MyFindTerminal> implements MyFindTerminal {
  constructor(private collection: Collection, options?: FindOptions) { super(options); }
  protected override create<T extends object, U extends object>(options: FindOptions) {
    return new MyFind<T, U>(this.collection as any, options);
  }
  async toArray(): Promise<TOutput[]> {
    return this.collection.find(this.options.filter ?? {}, this.options).toArray() as any;
  }
  build() { return { ...this.options }; }
}
```

Available methods: `where`, `select`, `sort`, `limit`, `skip`, `collation`, `hint`.

### FindById Builder

`FindByIdBuilder` is a restricted builder for single-document lookups by `_id`. Only `select()` and `hint()` are available — no `where`, `sort`, `limit`, or `skip`.

```ts
import { FindByIdBuilder } from 'mongo-typed';

// Subclass similarly to FindBuilder
class MyFindById<TInput extends object, TOutput extends object = TInput>
  extends FindByIdBuilder<TInput, TOutput, MyFindByIdTerminal> implements MyFindByIdTerminal {
  constructor(private collection: Collection, options?: FindOptions) { super(options); }
  protected override create<T extends object, U extends object>(options: FindOptions) {
    return new MyFindById<T, U>(this.collection as any, options);
  }
  async toObject(): Promise<TOutput | null> {
    return this.collection.findOne(this.options.filter ?? {}, this.options) as any;
  }
  build() { return { ...this.options }; }
}

// Usage in a repository
class UserRepository {
  find(filter?: Filter<User>) {
    return new MyFind<User>(this.collection, filter ? { filter } : {});
  }
  findById(id: string) {
    return new MyFindById<User>(this.collection, { filter: { _id: id } });
  }
}

// repo.find({ active: true }).select({ name: 1, email: 1 }).sort({ name: 1 }).limit(10).toArray()
// repo.findById('abc').select({ name: 1 }).toObject()
```

### Update Pipeline

MongoDB allows updates to use an aggregation pipeline instead of traditional operators. The `updatePipeline()` builder restricts the available stages to only the ones valid in updates: `$addFields`, `$set`, `$project`, `$unset`, `$replaceRoot`, `$replaceWith`.

```ts
import { updatePipeline } from 'mongo-typed';

const stages = updatePipeline<User>()
  .set({ fullName: { $concat: ['$firstName', ' ', '$lastName'] } })
  .unset('firstName')
  .build();
// Pass to collection.updateMany(filter, stages)
```

#### Extending the builder

`PipelineBuilder` is a generic base class that can be extended for custom terminal behavior. The second type parameter `TTerminal` controls what terminal methods (like `$merge` and `$out`) return:

```ts
import { PipelineBuilder } from 'mongo-typed';

interface MyTerminal {
  execute: () => Promise<object[]>;
}

class MyPipeline<T extends object> extends PipelineBuilder<T, MyTerminal> implements MyTerminal {
  async execute() {
    // run the pipeline against your database
    return this.stages;
  }

  protected override create<U extends object>(stages: object[]) {
    return new MyPipeline<U>(stages);
  }
}
```

## Status

- Filter types — stable
- Update types — stable
- Aggregation pipeline — stable
- Find / FindById builders — stable
- Actively maintained

## Contributing

Contributions and suggestions are welcome! Please open issues or PRs.

## License

MIT
