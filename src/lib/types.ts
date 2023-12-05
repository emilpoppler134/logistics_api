export interface IFilterItem {
  key: string;
  value: string | number | Date;
  query: EQueries;
}

export enum EQueries {
  IsEqual = "IsEqual",
  Before = "Before",
  After = "After",
  SameDate = "SameDate",
  SameDateTime = "SameDateTime",
}

export interface ISortItem {
  key: string;
  type: ESort;
}

export enum ESort {
  Ascending = "Ascending",
  Descending = "Descending"
}