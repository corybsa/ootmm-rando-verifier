import { ObjectId } from 'mongodb';

export interface IAuthRefSchema {
  _id: ObjectId;
  userId: ObjectId;
  selector: number;
  validator: string;
}
