/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { StandardInput, StandardType } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: standardAdd
// ====================================================

export interface standardAdd_standardAdd {
  __typename: "Standard";
  id: string;
  name: string;
  description: string | null;
  type: StandardType;
  schema: string;
  default: string | null;
  isFile: boolean;
  created_at: any;
}

export interface standardAdd {
  standardAdd: standardAdd_standardAdd;
}

export interface standardAddVariables {
  input: StandardInput;
}
