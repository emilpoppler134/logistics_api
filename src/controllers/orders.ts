import { Employee } from '../models/Employee';
import { IFilterItem, EQueries, ISortItem, ESort } from '../lib/types';
import { Order } from '../models/Order';
import { Product } from '../models/Product';
import { Types } from 'mongoose';

import type { Context } from 'elysia';
import type { IOrder, IProduct } from '../models/Order';

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
const sortKeyList: Array<string> = ["status", "orderNumber", "timestamp"];

async function list() {
  const orders: Array<IOrder> = await Order.find();
  return orders;
}

async function get(context: any) {
  if (!Types.ObjectId.isValid(context.params.id)) {
    throw new Error("Invalid id");
  }

  const id = new Types.ObjectId(context.params.id);
  const order: IOrder | null = await Order.findById(id);

  if (order === null) {
    throw new Error(`No order with id: ${id}`);
  }

  return { status: "OK", data: order };
}

async function search(context: Context<any>) {
  const query = context.query;

  if (query === null || Object.keys(query).length === 0 || query.filter === null || query.sort === null) {
    throw new Error("Invalid key in query");
  }

  try {
    JSON.parse(query.filter);

    if (query.sort !== undefined) {
      JSON.parse(query.sort);
    }
  } catch {
    throw new Error("Invalid json in filter query");
  }
  
  const filters: Array<IFilterItem> = JSON.parse(query.filter);
  const sort: ISortItem | undefined = query.sort !== undefined ? JSON.parse(query.sort) : undefined;

  if (!Array.isArray(filters) || filters.length === 0) {
    throw new Error("Filter query is not an array or it is empty");
  }

  // Get all orders
  let orders = await Order.find();
  
  // Validate each item in the filter
  filters.forEach((item) => {
    if (!filterKeyList.includes(item.key)) {
      throw new Error("Invalid key in filter");
    }
  });
  
  // Filter orders
  filters.forEach((filter: IFilterItem) => {
    if(!isKeyOfOrder(filter.key) || filter.key === null) {
      throw new Error("Invalid key in filter");
    }

    const key = filter.key;
    const value = filter.value;

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

  if (sort !== undefined) {
    if(!isKeyOfOrder(sort.key) || !sortKeyList.includes(sort.key)) {
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
  
  return orders;
}

async function create(context: Context<any>) {
  const body: ICreateParams = context.body;

  const id = new Types.ObjectId();
  const orderNumber = (await Order.find().sort().limit(1))[0].orderNumber + 1;

  const products: Array<IProduct> = [];

  for (const item of body.products) {
    const product = (await Product.find({"name": item.name}))[0];
    products.push({ id: product.id, amount: item.amount });
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

export default { list, get, search, create, update, remove };