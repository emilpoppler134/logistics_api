export interface IFilterItem {
  key: string | undefined;
  value: string | number | Date;
  query: EQueries;
}

export enum EQueries {
  IsEqual = "IsEqual",
  Before = "Before",
  After = "After",
  SameDate = "SameDate",
  SameMonth = "SameMonth",
  SameYear = "SameYear",
}

export interface ISortItem {
  key: ESortKeys;
  type: ESortType;
}

export enum ESortType {
  Ascending = "Ascending",
  Descending = "Descending"
}

export enum ESortKeys {
  Timestamp = "Timestamp",
  Price = "Price"
}