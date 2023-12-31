import { Employee } from '../models/Employee';
import { IFilterItem, ISortItem, EQueries, ESortKeys, ESortType } from '../lib/types';
import { Order } from '../models/Order';
import { Product } from '../models/Product';
import { Types } from 'mongoose';

import type { Context } from 'elysia';
import type { IOrder, ILineItem } from '../models/Order';
import type { IProduct } from '../models/Product';
import type { IEmployee } from '../models/Employee';

interface IOrderDetailed extends Omit<IOrder, 'products' | 'picker' | 'driver'> {
  products: Array<IDetailedLineItem>;
  picker: IEmployee;
  driver: IEmployee | null;
}

interface IDetailedLineItem extends Omit<ILineItem, 'product'> {
  product: IProduct;
}

// Create params
interface ICreateParams {
  products: Array<IProductParams>;
}

interface IProductParams {
  name: string;
  amount: number;
}

function isKeyOfOrder(key: string): key is keyof IOrder {
  return key in Order.schema.obj;
}

const filterKeyList: Array<string> = ["status", "orderNumber", "timestamp"];
const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

async function list(): Promise<Array<IOrderDetailed>> {
  return await Order.find()
    .populate({path: 'products.product', model: 'Product'})
    .populate({ path: 'picker', model: 'Employee' })
    .populate({ path: 'driver', model: 'Employee' });
}

async function get(context: any): Promise<IOrderDetailed> {
  if (!Types.ObjectId.isValid(context.params.id)) {
    throw new Error("Invalid id");
  }

  const id = new Types.ObjectId(context.params.id);

  const order: IOrderDetailed | null = await Order.findById(id)
    .populate({path: 'products.product', model: 'Product'})
    .populate({ path: 'picker', model: 'Employee' })
    .populate({ path: 'driver', model: 'Employee' });

  if (order === null) {
    throw new Error(`No order with id: ${id}`);
  }

  return order;
}

async function search(context: Context<any>): Promise<Array<IOrderDetailed>> {
  const query = context.query;

  if (!query || !Object.keys(query).length || query.filter == null) {
    throw new Error("Invalid query");
  }

  try {
    JSON.parse(query.filter);

    if (query.sort) {
      JSON.parse(query.sort);
    }
  } catch {
    throw new Error("Invalid json in filter query");
  }

  const filters: Array<IFilterItem> = JSON.parse(query.filter);
  const sort: ISortItem | undefined = query.sort ? JSON.parse(query.sort) : undefined;

  const orders: Array<IOrderDetailed> = await filterOrders({filters, sort});
  return orders;
}

async function sales(context: any): Promise<number> {
  const month: string = context.params.month.toLowerCase();

  if (!months.map(item => item.toLowerCase()).includes(month)) {
    throw new Error("Invalid month");
  }

  const today = new Date();

  const filters: Array<IFilterItem> = [{
    key: "timestamp",
    query: EQueries.SameMonth,
    value: new Date(today.getFullYear() + "-" + months.map(item => item.toLowerCase()).indexOf(month))
  }];

  const orders: Array<IOrderDetailed> = await filterOrders({filters});

  const totalSum = orders
    .map(order => {
      return order.products.reduce((a, b) => a + (b.product.price * b.amount), 0);
    })
    .reduce((a, b) => a + b, 0);

  return totalSum;
}

async function mostExpensive(context: any): Promise<IOrderDetailed | string> {
  const month: string = context.params.month.toLowerCase();

  if (!months.map(item => item.toLowerCase()).includes(month)) {
    throw new Error("Invalid month");
  }

  const today = new Date();

  const filters: Array<IFilterItem> = [{
    key: "timestamp",
    query: EQueries.SameMonth,
    value: new Date(today.getFullYear() + "-" + (months.map(item => item.toLowerCase()).indexOf(month) + 1))
  }];

  const sort: ISortItem = {
    key: ESortKeys.Price,
    type: ESortType.Descending,
  };

  const orders: Array<IOrderDetailed> = await filterOrders({filters, sort});

  return orders.length > 0 ? orders[0] : "No orders in " + month;
}

async function status(context: any): Promise<Array<IOrderDetailed> | string> {
  const status: string = context.params.status;

  const filters: Array<IFilterItem> = [{
    key: "status",
    query: EQueries.IsEqual,
    value: status
  }];

  const orders: Array<IOrderDetailed> = await filterOrders({filters});

  return orders.length > 0 ? orders : "No order with status " + status;
}

async function oldest(context: any): Promise<IOrderDetailed | string> {
  const status: string = context.params.status;

  const filters: Array<IFilterItem> = [{
    key: "status",
    query: EQueries.IsEqual,
    value: status
  }];

  const sort: ISortItem = {
    key: ESortKeys.Timestamp,
    type: ESortType.Ascending,
  };

  const orders: Array<IOrderDetailed> = await filterOrders({filters, sort});

  return orders.length > 0 ? orders[0] : "No order with status " + status;
}

async function create(context: Context<any>) {
  const body: ICreateParams = context.body;

  const id = new Types.ObjectId();
  const orderNumber = (await Order.find().sort().limit(1))[0].orderNumber + 1;

  const products: Array<ILineItem> = [];

  for (const item of body.products) {
    const product = (await Product.find({"name": item.name}))[0];
    products.push({ product: product.id, amount: item.amount });
  }

  const pickerEmployees = await Employee.find({'role': 'Picker'});
  const random = Math.floor(Math.random() * pickerEmployees.length);
  const picker = pickerEmployees[random].id;

  const order = await Order.create({ id, orderNumber, products, picker });

  return { status: "OK", data: order };
}

async function update(context: Context<any>) {

}

async function remove(context: Context<any>) {

}

async function filterOrders({filters, sort}: {filters: Array<IFilterItem>, sort?: ISortItem | undefined}): Promise<Array<IOrderDetailed>> {
  if (!Array.isArray(filters) || filters.length === 0) {
    throw new Error("Filter query is not an array or it is empty");
  }

  // Validate each item in the filter
  filters.forEach((item) => {
    if (item.key && !filterKeyList.includes(item.key)) {
      throw new Error("Invalid key in filter");
    }
  });

  // Get all orders
  let orders: Array<IOrderDetailed> = await Order.find()
    .populate({path: 'products.product', model: 'Product'})
    .populate({ path: 'picker', model: 'Employee' })
    .populate({ path: 'driver', model: 'Employee' });

  // Filter orders
  filters.forEach((filter: IFilterItem) => {
    switch (filter.query) {
      case EQueries.IsEqual: {
        orders = orders.filter((order) => {
          if(filter.key === undefined || !isKeyOfOrder(filter.key)) {
            throw new Error("Invalid key in filter");
          }

          return order[filter.key] === filter.value;
        });
      } break;

      case EQueries.Before: {
        orders = orders.filter((order) => new Date(order.timestamp) < new Date(filter.value));
      } break;

      case EQueries.After: {
        orders = orders.filter((order) => new Date(order.timestamp) > new Date(filter.value));
      } break;

      case EQueries.SameDate: {
        orders = orders.filter((order) => {
          const scheduleDate = new Date(order.timestamp);
          const valueDate = new Date(filter.value);

          return scheduleDate.getFullYear() === valueDate.getFullYear() && scheduleDate.getMonth() === valueDate.getMonth() && scheduleDate.getDate() === valueDate.getDate();
        });
      } break;

      case EQueries.SameMonth: {
        orders = orders.filter((order) => {
          const scheduleDate = new Date(order.timestamp);
          const valueDate = new Date(filter.value);

          return scheduleDate.getFullYear() === valueDate.getFullYear() && scheduleDate.getMonth() === valueDate.getMonth();
        });
      } break;

      case EQueries.SameYear: {
        orders = orders.filter((order) => new Date(order.timestamp).getFullYear() === new Date(filter.value).getFullYear());
      } break;
    
      default: {
        orders = [];
      } break;
    }
  });

  if (sort !== undefined) {
    switch (sort.key) {
      case ESortKeys.Timestamp: {
        switch(sort.type) {
          case ESortType.Ascending: {
            orders.sort(function (a, b) {return new Date(a.timestamp).valueOf() - new Date(b.timestamp).valueOf()});
          } break;

          case ESortType.Descending: {
            orders.sort(function (a, b) {return new Date(b.timestamp).valueOf() - new Date(a.timestamp).valueOf()});
          } break;
        }
      } break;

      case ESortKeys.Price: {
        switch(sort.type) {
          case ESortType.Ascending: {
            orders.sort(function (a, b) {
              return Math.min(...a.products.map(item => item.product.price)) - Math.min(...b.products.map(item => item.product.price));
            });
          } break;

          case ESortType.Descending: {
            orders.sort(function (a, b) {
              return Math.min(...b.products.map(item => item.product.price)) - Math.min(...a.products.map(item => item.product.price));
            });
          } break;
        }
      } break;
    }
  }
   
  return orders;
}

export default { list, get, search, sales, mostExpensive, status, oldest, create, update, remove };