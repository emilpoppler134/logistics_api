import { Schema, model, Types } from 'mongoose';

export interface ICompany {
  id: Types.ObjectId;
  name: string;
  storage: Array<Types.ObjectId>;
  employees: Array<Types.ObjectId>;
}

const companySchema = new Schema<ICompany>(
  {
    name: {
      type: String,
      required: true
    },
    storage: [
      {
        type: Schema.Types.ObjectId,
        required: true
      }
    ],
    employees: [
      {
        type: Schema.Types.ObjectId,
        required: true
      }
    ]
  }
);

export const Company = model<ICompany>('Company', companySchema);
