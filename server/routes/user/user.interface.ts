import { ObjectId } from 'mongodb';

export interface IResetPasswordResponse {
  email: string;
}

export interface IUserSchema {
  _id: ObjectId;
  username: string;
  hash?: string;
  email: string;
  passwordResetCode?: string;
  userRoleId: number;
  firstName: string;
  lastName: string;
  lastLoggedIn: Date;
}

export interface IRoleSchema {
  _id: ObjectId;
  roleId: number;
  roleName: string;
  roleDescription: string;
}
