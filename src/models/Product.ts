import { Schema, model, Types } from 'mongoose';

export interface IProduct {
  id: Types.ObjectId;
  name: String;
  price: Number;
  weight: Number;
  location: Types.ObjectId;
}

const productSchema = new Schema<IProduct>(
  {
    name: {
      type: String,
      required: true
    },
    price: {
      type: Number,
      required: true
    },
    weight: {
      type: Number,
      required: true
    },
    location: {
      type: Schema.Types.ObjectId,
      required: true
    }
  }
);

export const Product = model<IProduct>('Product', productSchema);
