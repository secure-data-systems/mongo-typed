# mongotypes

TypeScript utility types for building strongly-typed MongoDB filters, and updates — without adding dependencies.

## Overview

`mongotypes` provides type-safe MongoDB-style query and update utilities in TypeScript. It is designed to assist with building fully-typed data repository layers or services that interact with MongoDB-like syntax, without relying on external libraries or runtime packages.

Whether you're working with an actual MongoDB database or implementing similar patterns in your application logic, `mongotypes` gives you strong typing for common Mongo operations like filters, and updates.

## Features

- 🧠 Fully typed **filter** support (including `$and`, `$or`, `$in`, `$elemMatch`, etc.)
- ✍️ Strongly typed **update** operations (e.g., `$set`, `$inc`, `$unset`, etc.)
- 💡 No dependencies — pure TypeScript
- 🔐 Helps catch invalid Mongo-like queries at compile time

## Installation

```bash
pnpm add mongotypes
# or
npm install mongotypes
# or
yarn add mongotypes
```

## Usage

### Basic Filter Type

```ts
import { Filter } from 'mongotypes';

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

### Basic Update Type

```ts
import { Update } from 'mongotypes';

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

### Aggregation Types (Coming Soon)

Aggregation support is in active development and aims to type:
- `$match`
- `$group`
- `$project`
- `$sort`, `$limit`, `$lookup`, and more

## Why Use `mongotypes`?

TypeScript developers working with MongoDB often find themselves wishing for deeper type safety on filters and updates — especially in larger projects or those with repository abstraction layers.

`mongotypes` solves this by bringing compile-time validation of Mongo-style operations, helping prevent costly runtime errors due to typos or invalid operations.

## Status

- ✅ Filter types – stable
- ✅ Update types – in progress
- 🧪 Aggregation types – coming soon
- 🔄 Actively maintained

## Contributing

Contributions and suggestions are welcome! Please open issues or PRs to help improve support for advanced MongoDB operators or aggregations.

## License

MIT
