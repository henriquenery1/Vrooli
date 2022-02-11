/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { MemberRole } from "./globalTypes";

// ====================================================
// GraphQL fragment: organizationFields
// ====================================================

export interface organizationFields_tags {
  __typename: "Tag";
  id: string;
  tag: string;
  description: string | null;
  created_at: any;
  stars: number;
  isStarred: boolean;
}

export interface organizationFields {
  __typename: "Organization";
  id: string;
  name: string;
  bio: string | null;
  created_at: any;
  tags: organizationFields_tags[];
  stars: number;
  isStarred: boolean;
  role: MemberRole | null;
}
