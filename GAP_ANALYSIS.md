# Gap Analysis: mongo-typed vs MongoDB Operator Reference

> **Status**: All identified gaps have been resolved. This document is retained for historical reference.

---

## Fixed in `src/expr.ts`

### Structural bugs

| Type | Operator(s) | Fix |
|---|---|---|
| `ConditionalExpr` | (interface) | Converted from all-optional interface to discriminated union — eliminates `{}` match and prevents mixing branches |
| `DateTimezoneExpr` | `timezone` | Made optional (`timezone?`) to match MongoDB spec |

### Wrong argument types

| Type | Operator | Was | Now |
|---|---|---|---|
| `ConditionalExpr` | `$ifNull` | `[Expr, Expr]` | `[Expr, Expr, ...Expr[]]` — variadic since MongoDB 5.0 |
| `ConditionalExpr` | `$switch.default` | `default: Expr` (required) | `default?: Expr` — optional per MongoDB docs |
| `NumericExpr` | `$convert` | `to: NumericBsonType` | `to: BsonType \| BsonTypeNumeric` — supports all BSON types |
| `NumericExpr` | `$dateDiff` | no `startOfWeek` | added `startOfWeek?: StringExpr` |
| `DateExpr` | `$dateFromParts` | calendar form only | added ISO week-date overload: `isoWeekYear` (required), `isoWeek?`, `isoDayOfWeek?` |
| `ArrayExpr` | `$filter` | no `limit` | added `limit?: NumericExpr` (MongoDB 5.2) |

### Added operators

#### `ArrayExpr`
| Operator | Notes |
|---|---|
| `$sortArray` | Sorts array elements — added in MongoDB 5.2 |

#### `BooleanExpr`
| Operator | Notes |
|---|---|
| `$isNumber` | Returns `true` if expression resolves to a numeric BSON type |
| `$toBool` | Converts an expression to a Boolean |

#### `NumericExpr`
| Operator | Notes |
|---|---|
| `$cmp` | Compares two values, returning `-1`, `0`, or `1` |

#### `ObjectExpr` (new sub-type)
| Operator | Notes |
|---|---|
| `$getField` | Returns the value of a named field — supports fields with `.` or `$` in the name; added in MongoDB 5.0 |
| `$mergeObjects` | Merges two or more documents into one |
| `$regexFind` | Returns the first regex match with index and capture groups |
| `$regexFindAll` | Returns all regex matches |

#### `TypeExpr`
| Operator | Notes |
|---|---|
| `$toObjectId` | Converts an expression to an ObjectId |

---

## Fixed in `src/filter.ts`

| Location | Operator | Fix |
|---|---|---|
| `FilterOperators` | `$rand` | Removed — not a query filter operator (aggregation-only) |
| `FilterOperators` | `$type` | Now accepts `Array<BsonType \| BsonTypeNumeric>` in addition to a single value |
| `FilterOperators` | `$geoWithin` | Added legacy shape operators for `[number, number]` coordinate fields: `$box`, `$polygon`, `$center`, `$centerSphere` |
| `ObjFilterOperators` | `$expr` | Added top-level `$expr?: Expr<TSchema>` alongside `$and`, `$or`, etc. |

---

## All issues resolved

| Priority | Count | Status |
|---|---|---|
| Medium | 6 | ✓ Missing `Expr`-level operators (`$getField`, `$mergeObjects`, `$regexFind`, `$regexFindAll`, `$toBool`, `$toObjectId`) |
| Medium | 4 | ✓ Filter gaps (`$rand` removed, `$type` array, `$geoWithin` legacy, `$expr` top-level) |
| Medium | 4 | ✓ Wrong argument shapes (`$ifNull` variadic, `$switch.default` optional, `$dateFromParts` ISO week, `$filter.limit`) |
| Medium | 1 | ✓ `ConditionalExpr` structural bug (all-optional interface → discriminated union) |
| Medium | 1 | ✓ `DateTimezoneExpr.timezone` incorrectly required → optional |
| Medium | 1 | ✓ `$convert.to` type too narrow (`NumericBsonType` → `BsonType \| BsonTypeNumeric`) |
| Low | 3 | ✓ Missing operators: `$sortArray`, `$cmp`, `$isNumber` |
| Low | 1 | ✓ `$dateDiff` missing `startOfWeek` |
