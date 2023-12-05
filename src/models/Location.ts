import { Schema, model, Types } from 'mongoose';

export interface ILocation {
  id: Types.ObjectId;
  quantity: number;
  location: number;
  storage: Types.ObjectId;
}

const locationSchema = new Schema<ILocation>(
  {
    quantity: {
      type: Number,
      required: true
    },
    location: {
      type: Number,
      required: true
    },
    storage: {
      type: Schema.Types.ObjectId,
      required: true
    }
  }
);

export const Location = model<ILocation>('Location', locationSchema);
