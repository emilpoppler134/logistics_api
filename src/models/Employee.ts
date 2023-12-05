import { Schema, model, Types } from 'mongoose';

export enum ERole {
  Picker = "Picker",
  Driver = "Driver"
}

export interface IEmployee {
  id: Types.ObjectId;
  name: string;
  role: ERole;
  schedule: Array<IShift>;
}

interface IShift {
  start: Date;
  end: Date;
}

const employeeSchema = new Schema<IEmployee>(
  {
    name: {
      type: String,
      required: true
    },
    role: {
      type: String,
      required: true,
      enum: [ERole.Driver, ERole.Picker]
    },
    schedule: [
      {
        start: {
          type: Date,
          required: true
        },
        end: {
          type: Date,
          required: true
        }
      }
    ]
  }
);

export const Employee = model<IEmployee>('Employee', employeeSchema);
