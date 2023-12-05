import { Schema, model, Types } from 'mongoose';
import { Employee, ERole } from './Employee';

enum EStatus {
  OrderPlaced = "Order placed",
  SearchingDriver = "Searching driver",
  Delivered = "Delivered",
  Done = "Done"
}

export interface IOrder {
  id: Types.ObjectId;
  orderNumber: number;
  products: Array<IProduct>;
  picker: Types.ObjectId;
  driver: Types.ObjectId | null;
  status: EStatus;
  timestamp: Date;
}

export interface IProduct {
  id: Types.ObjectId;
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
        id: {
          type: Schema.Types.ObjectId,
          required: true
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
      }
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
      }
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
