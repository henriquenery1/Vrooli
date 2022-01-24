/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { FindByIdInput } from "./globalTypes";

// ====================================================
// GraphQL query operation: organization
// ====================================================

export interface organization_organization_tags {
  __typename: "Tag";
  id: string;
  tag: string;
  description: string | null;
  created_at: any;
  stars: number;
  isStarred: boolean | null;
}

export interface organization_organization {
  __typename: "Organization";
  id: string;
  name: string;
  bio: string | null;
  created_at: any;
  tags: organization_organization_tags[];
  stars: number;
  isStarred: boolean | null;
}

export interface organization {
  organization: organization_organization | null;
}

export interface organizationVariables {
  input: FindByIdInput;
}
