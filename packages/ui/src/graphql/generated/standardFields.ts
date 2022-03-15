/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { MemberRole, StandardType } from "./globalTypes";

// ====================================================
// GraphQL fragment: standardFields
// ====================================================

export interface standardFields_tags_translations {
  __typename: "TagTranslation";
  id: string;
  language: string;
  description: string | null;
}

export interface standardFields_tags {
  __typename: "Tag";
  id: string;
  tag: string;
  translations: standardFields_tags_translations[];
}

export interface standardFields_translations {
  __typename: "StandardTranslation";
  id: string;
  language: string;
  description: string | null;
}

export interface standardFields_creator_Organization_translations {
  __typename: "OrganizationTranslation";
  id: string;
  language: string;
  name: string;
}

export interface standardFields_creator_Organization {
  __typename: "Organization";
  id: string;
  translations: standardFields_creator_Organization_translations[];
}

export interface standardFields_creator_User {
  __typename: "User";
  id: string;
  username: string | null;
}

export type standardFields_creator = standardFields_creator_Organization | standardFields_creator_User;

export interface standardFields {
  __typename: "Standard";
  id: string;
  name: string;
  role: MemberRole | null;
  type: StandardType;
  schema: string;
  default: string | null;
  isFile: boolean;
  created_at: any;
  tags: standardFields_tags[];
  translations: standardFields_translations[];
  creator: standardFields_creator | null;
  stars: number;
  isStarred: boolean;
  score: number;
  isUpvoted: boolean | null;
}