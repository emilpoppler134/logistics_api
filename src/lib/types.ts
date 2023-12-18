export interface IFilterItem {
  key?: string;
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
  Available = "Available"
}

export enum EScheduleOption {
  start = "start",
  end = "end"
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