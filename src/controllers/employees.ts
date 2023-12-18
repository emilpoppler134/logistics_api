import { Employee } from '../models/Employee';
import { Order, EStatus } from '../models/Order';
import { IFilterItem, EQueries, EScheduleOption } from '../lib/types';
import { Types } from 'mongoose';

import type { Context } from 'elysia';
import type { IEmployee, IShift } from '../models/Employee';
import type { IOrder } from '../models/Order';

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
  
  const employees: Array<IEmployee> = await filterEmployees({filters});
  return employees;
}

async function date(context: any): Promise<Array<IEmployee> | string> {
  const date: string = context.params.date;

  const filters: Array<IFilterItem> = [{
    query: EQueries.SameDate,
    value: date,
  }];

  const employees: Array<IEmployee> = await filterEmployees({filters});

  return employees.length > 0 ? employees : "No employee works on date " + date;
}

async function availablePickers(context: any): Promise<Array<IEmployee> | string> {
  const today = new Date();
  today.setHours(today.getHours() + 1);

  const filters: Array<IFilterItem> = [
    {
      value: today,
      query: EQueries.Available,
    },
    {
      key: "role",
      query: EQueries.IsEqual,
      value: "Picker",
    }
  ];

  const employees: Array<IEmployee> = await filterEmployees({filters});
  const availablePickers: Array<IEmployee> = [];

  for (const employee of employees) {
    const orders = await Order.find({picker: employee.id, status: EStatus.OrderPlaced});
    if (orders.length === 0) availablePickers.push(employee);
  }

  return availablePickers.length > 0 ? availablePickers : "No available pickers at the moment";
}

async function create(context: Context<any>) {

}

async function update(context: Context<any>) {

}

async function remove(context: Context<any>) {

}

async function filterEmployees({filters}: {filters: Array<IFilterItem>}): Promise<Array<IEmployee>> {
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

      case EQueries.Available: {
        employees = employees.filter((employee) => {
          for (let i = 0; i < employee.schedule.length; i++) {
            const item: IShift = employee.schedule[i];

            const now = new Date(filter.value);
            const startDate = new Date(item.start);
            const endDate = new Date(item.end);
            
            if (now > startDate && now < endDate)
              return true;
          }
          return false;
        });
      } break;

      case EQueries.SameDate: {
        employees = employees.filter((employee) => {
          for (let i = 0; i < employee.schedule.length; i++) {
            const item = employee.schedule[i];
            const scheduleDate = new Date(item.start);
            const valueDate = new Date(filter.value);

            if (scheduleDate.getFullYear() === valueDate.getFullYear() && scheduleDate.getMonth() === valueDate.getMonth() && scheduleDate.getDate() === valueDate.getDate())
              return true;
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

            if (scheduleDate.getFullYear() === valueDate.getFullYear() && scheduleDate.getMonth() === valueDate.getMonth())
              return true;
          }
          return false;
        });
      } break;

      case EQueries.SameYear: {
        employees = employees.filter((employee) => {
          for (let i = 0; i < employee.schedule.length; i++) {
            const item = employee.schedule[i];

            if (new Date(item.start).getFullYear() === new Date(filter.value).getFullYear())
              return true;
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

export default { list, get, search, date, availablePickers, create, update, remove }