import { Schema, model, Types } from 'mongoose';
import { Employee, ERole } from './Employee';

enum EStatus {
  OrderPlaced = "OrderPlaced",
  SearchingDriver = "SearchingDriver",
  Delivered = "Delivered",
  Done = "Done"
}

export interface IOrder {
  id: Types.ObjectId;
  orderNumber: number;
  products: Array<ILineItem>;
  picker: Types.ObjectId;
  driver: Types.ObjectId | null;
  status: EStatus;
  timestamp: Date;
}

export interface ILineItem {
  product: Types.ObjectId;
  amount: number;
}

const orderSchema = new Schema<IOrder>(
  {
    orderNumber: {
      type: Number,
      required: true
    },
    products: [
      {
        product: {
          type: Schema.Types.ObjectId,
          required: true,
          ref: 'Product'
        },
        amount: {
          type: Number,
          required: true
        },
      }
    ],
    picker: {
      type: Schema.Types.ObjectId,
      required: true,
      validate: {
        validator: async (v: Types.ObjectId) => {
          const employee = await Employee.findById(v);
          return (employee && employee.role === ERole.Picker);
        }
      },
      ref: 'Employee'
    },
    driver: {
      type: Schema.Types.ObjectId,
      required: false,
      default: () => null,
      validate: {
        validator: async (v: Types.ObjectId | null) => {
          if (v === null) return true;
          
          const employee = await Employee.findById(v);
          return (employee && employee.role === ERole.Driver);
        }
      },
      ref: 'Employee'
    },
    status: {
      type: String,
      required: true,
      enum: [EStatus.OrderPlaced, EStatus.SearchingDriver, EStatus.Delivered, EStatus.Done],
      default: () => EStatus.OrderPlaced
    },
    timestamp: {
      type: Date,
      required: true,
      default: () => Date.now()
    }
  }
);

export const Order = model<IOrder>('Order', orderSchema);
