export interface IUser {
  _id: string;
  username: string;
  hash?: string;
  email: string;
  userRoleId: number;
  firstName: string;
  lastName: string;
  lastLoggedIn: Date;
  token?: string;
}
  