import { Employee } from '../models/Employee';
import { IFilterItem, EQueries } from '../lib/types';
import { Types } from 'mongoose';

import type { Context } from 'elysia';
import type { IEmployee } from '../models/Employee';

function isKeyOfEmployee(key: string): key is keyof IEmployee {
  return key in Employee.schema.obj;
}

const filterKeyList: Array<string> = ["name", "role"];

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
  // Validate input
  const query = context.query;

  if (!query || !Object.keys(query).length || query.filter == null) {
    throw new Error("Invalid query");
  }

  try {
    JSON.parse(query.filter);
  } catch {
    throw new Error("Invalid json in filter query");
  }

  const filters: Array<IFilterItem> = JSON.parse(query.filter);
  
  if (!Array.isArray(filters) || filters.length === 0) {
    throw new Error("Filter query is not an array or it is empty");
  }

  // Validate each item in the filter
  filters.forEach((item) => {
    if (item.key && !filterKeyList.includes(item.key)) {
      throw new Error("Invalid key in filter");
    }
  });

  // Get all employees
  let employees: Array<IEmployee> = await Employee.find();
  
  // Validate each item in the filter
  filters.forEach((item) => {
    if (item.key && !filterKeyList.includes(item.key)) {
      throw new Error("Invalid key in filter");
    }
  });

  // Filter employees
  filters.forEach((filter: IFilterItem) => {
    switch (filter.query) {
      case EQueries.IsEqual: {
        employees = employees.filter((employee) => {
          if(filter.key === undefined || !isKeyOfEmployee(filter.key)) {
            throw new Error("Invalid key in filter");
          }

          return employee[filter.key] === filter.value;
        });
      } break;

      case EQueries.SameDate: {
        employees = employees.filter((employee) => {
          for (let i = 0; i < employee.schedule.length; i++) {
            const item = employee.schedule[i];
            const scheduleDate = new Date(item.start);
            const valueDate = new Date(filter.value);

            const sameDate = scheduleDate.getFullYear() === valueDate.getFullYear() && scheduleDate.getMonth() === valueDate.getMonth() && scheduleDate.getDate() === valueDate.getDate();
            if (sameDate) {
              return sameDate;
            }
          }
          return false;
        });
      } break;

      case EQueries.SameMonth: {
        employees = employees.filter((employee) => {
          for (let i = 0; i < employee.schedule.length; i++) {
            const item = employee.schedule[i];
            const scheduleDate = new Date(item.start);
            const valueDate = new Date(filter.value);

            const sameMonth = scheduleDate.getFullYear() === valueDate.getFullYear() && scheduleDate.getMonth() === valueDate.getMonth();
            if (sameMonth) {
              return sameMonth;
            }
          }
          return false;
        });
      } break;

      case EQueries.SameYear: {
        employees = employees.filter((employee) => {
          for (let i = 0; i < employee.schedule.length; i++) {
            const item = employee.schedule[i];

            const sameYear = new Date(item.start).getFullYear() === new Date(filter.value).getFullYear();
            if (sameYear) {
              return sameYear;
            }
          }
          return false;
        });
      } break;

      default: {
        employees = [];
      } break;
    }
  });

  return employees;
}

async function create(context: Context<any>) {

}

async function update(context: Context<any>) {

}

async function remove(context: Context<any>) {

}

export default { list, get, search, create, update, remove }