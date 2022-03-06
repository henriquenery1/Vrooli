/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { OrganizationCreateInput, MemberRole } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: organizationCreate
// ====================================================

export interface organizationCreate_organizationCreate_tags {
  __typename: "Tag";
  id: string;
  description: string | null;
  tag: string;
}

export interface organizationCreate_organizationCreate {
  __typename: "Organization";
  id: string;
  bio: string | null;
  created_at: any;
  isOpenToNewMembers: boolean;
  isStarred: boolean;
  name: string;
  role: MemberRole | null;
  stars: number;
  tags: organizationCreate_organizationCreate_tags[];
}

export interface organizationCreate {
  organizationCreate: organizationCreate_organizationCreate;
}

export interface organizationCreateVariables {
  input: OrganizationCreateInput;
}
