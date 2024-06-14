import validator from "validator";
import isEmpty from "is-empty";
import e from "cors";

export interface signUpUser {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface loginUser {
  email: string;
  password: string;
}

export interface changePassword {
  email: string;
}
export interface category {
  title: string;
  icon: string;
  desc: string;
  price: number;
  percent: number;
}

export interface createCategoryType {
  categories: category[];
}

export interface budget {
  monthlyIncome: number;
  annualRent: number;
  gender: string;
  maritalStatus: string;
  modeOfTransport: string;
  defaultCurrency: string;
  categories: category[];
}
