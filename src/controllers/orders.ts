import type { Context } from 'elysia';
import { IOrder, Order } from '../models/Order';

interface IParams {
  action: EAction;
  filter: Array<IFilterItem>;
  sort: ISortItem | null;
}

enum EAction {
  List = "List",
  Find = "Find",
}

interface IFilterItem {
  key: string;
  value: string | number | Date;
  query: EQueries;
}

enum EQueries {
  IsEqual = "IsEqual",
  Before = "Before",
  After = "After",
  SameDate = "SameDate",
  SameDateTime = "SameDateTime",
}

interface ISortItem {
  key: string;
  type: ESort;
}

enum ESort {
  Ascending = "Ascending",
  Descending = "Descending"
}

function isKeyOfOrder(key: string): key is keyof IOrder {
  return key in Order.schema.obj;
}

const keyList: Array<string> = ["status", "orderNumber", "timestamp"];

async function all(context: Context<any>) {
  const body: IParams = context.body;
  const filters = body.filter;

  // Validate each item in the filter
  filters.forEach((item) => {
    if (!keyList.includes(item.key)) {
      throw new Error("Invalid key in filter");
    }
  });

  // Get all orders
  let orders = await Order.find();

  // Filter orders
  filters.forEach((filter: IFilterItem) => {
    if(!isKeyOfOrder(filter.key) || filter.key === null) {
      throw new Error("Invalid key in filter");
    }

    const key = filter.key;
    const value = filter.value || "";

    switch (filter.query) {
      case EQueries.IsEqual: {
        orders = orders.filter((order) => order[key] === value);
      } break;

      case EQueries.Before: {
        orders = orders.filter((order) => new Date(order[key]) < new Date(value));
      } break;

      case EQueries.After: {
        orders = orders.filter((order) => new Date(order[key]) > new Date(value));
      } break;

      case EQueries.SameDate: {
        orders = orders.filter((order) => {
          return new Date(order[key]).toISOString().split('T')[0] === new Date(value).toISOString().split('T')[0];
        });
      } break;

      case EQueries.SameDateTime: {
        orders = orders.filter((order) => new Date(order[key]).toISOString() === new Date(value).toISOString());
      } break;

      default: {
        orders = [];
      } break;
    }
  });

  if (body.sort !== null) {
    const sort = body.sort;

    if(!isKeyOfOrder(sort.key) || !keyList.includes(sort.key)) {
      throw new Error("Invalid key in sort");
    }

    const key = sort.key;
    
    switch (sort.type) {
      case ESort.Ascending: {
        orders.sort(function (a, b) {return a[key] - b[key]});
      } break;
  
      case ESort.Descending: {
        orders.sort(function (a, b) {return b[key] - a[key]});
      } break;
    }
  }

  if (body.action === EAction.Find) {
    if (orders.length > 0) {
      orders = [orders[0]];
    }
  }
  
  return orders;
}

async function create() {

}

export default { all, create };