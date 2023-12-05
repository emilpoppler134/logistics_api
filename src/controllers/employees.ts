import { Employee } from '../models/Employee';
import { IFilterItem, EQueries, ISortItem, ESort } from '../lib/types';
import { Types } from 'mongoose';

import type { Context } from 'elysia';
import type { IEmployee } from '../models/Employee';

function isKeyOfEmployee(key: string): key is keyof IEmployee {
  return key in Employee.schema.obj;
}

const filterKeyList: Array<string> = ["name", "role"];
const sortKeyList: Array<string> = ["name", "role"];

async function list() {
  const employees: Array<IEmployee> = await Employee.find();
  return employees;
}

async function get(context: any) {
  if (!Types.ObjectId.isValid(context.params.id)) {
    throw new Error("Invalid id");
  }

  const id = new Types.ObjectId(context.params.id);
  const employee: IEmployee | null = await Employee.findById(id);

  if (employee === null) {
    throw new Error(`No order with id: ${id}`);
  }

  return { status: "OK", data: employee };
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

  // Get all employees
  let employees = await Employee.find();
  
  // Validate each item in the filter
  filters.forEach((item) => {
    if (!filterKeyList.includes(item.key)) {
      throw new Error("Invalid key in filter");
    }
  });
  
  // Filter employees
  filters.forEach((filter: IFilterItem) => {
    if(!isKeyOfEmployee(filter.key) || filter.key === null) {
      throw new Error("Invalid key in filter");
    }

    const key = filter.key;
    const value = filter.value;

    switch (filter.query) {
      case EQueries.IsEqual: {
        employees = employees.filter((employee) => employee[key] === value);
      } break;

      case EQueries.Before: {
        employees = employees.filter((employee) => new Date(employee[key]) < new Date(value));
      } break;

      case EQueries.After: {
        employees = employees.filter((employee) => new Date(employee[key]) > new Date(value));
      } break;

      case EQueries.SameDate: {
        employees = employees.filter((employee) => {
          return new Date(employee[key]).toISOString().split('T')[0] === new Date(value).toISOString().split('T')[0];
        });
      } break;

      case EQueries.SameDateTime: {
        employees = employees.filter((employee) => new Date(employee[key]).toISOString() === new Date(value).toISOString());
      } break;

      default: {
        employees = [];
      } break;
    }
  });

  if (sort !== undefined) {
    if(!isKeyOfEmployee(sort.key) || !sortKeyList.includes(sort.key)) {
      throw new Error("Invalid key in sort");
    }

    const key = sort.key;
    
    switch (sort.type) {
      case ESort.Ascending: {
        employees.sort(function (a, b) {return a[key] - b[key]});
      } break;
  
      case ESort.Descending: {
        employees.sort(function (a, b) {return b[key] - a[key]});
      } break;
    }
  }
  
  return employees;
}

async function create(context: Context<any>) {

}

async function update(context: Context<any>) {

}

async function remove(context: Context<any>) {

}

export default { list, get, search, create, update, remove }