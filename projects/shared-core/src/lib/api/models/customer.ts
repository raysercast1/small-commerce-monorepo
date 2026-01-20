import {CustomerType} from '../types/main-enums';
import {Address} from './address';

export interface Customer {
  id: string;
  username: string;
  lastname: string;
  email: string;
  customerType: CustomerType;
  addresses: Address[];
}
