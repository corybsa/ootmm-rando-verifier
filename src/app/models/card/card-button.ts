export interface ICardButton {
  icon: string;
  altIcon?: string;
  iconLogic?: string;
  color: 'primary' | 'danger' | 'other';
  action: (item: any) => any;
}
