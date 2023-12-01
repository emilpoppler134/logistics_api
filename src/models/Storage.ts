import { Schema, model, Types } from 'mongoose';

export interface IStorage {
  id: Types.ObjectId;
  products: Array<Types.ObjectId>;
}

const storageSchema = new Schema<IStorage>(
  {
    products: [
      {
        type: Schema.Types.ObjectId,
        required: true
      }
    ]
  }
);

export const Storage = model<IStorage>('Storage', storageSchema);
