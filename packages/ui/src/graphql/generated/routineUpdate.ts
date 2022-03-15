/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { RoutineUpdateInput, NodeType, MemberRole, ResourceListUsedFor, ResourceUsedFor } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: routineUpdate
// ====================================================

export interface routineUpdate_routineUpdate_inputs_standard_tags_translations {
  __typename: "TagTranslation";
  id: string;
  language: string;
  description: string | null;
}

export interface routineUpdate_routineUpdate_inputs_standard_tags {
  __typename: "Tag";
  id: string;
  tag: string;
  translations: routineUpdate_routineUpdate_inputs_standard_tags_translations[];
}

export interface routineUpdate_routineUpdate_inputs_standard_translations {
  __typename: "StandardTranslation";
  id: string;
  language: string;
  description: string | null;
}

export interface routineUpdate_routineUpdate_inputs_standard {
  __typename: "Standard";
  id: string;
  default: string | null;
  isFile: boolean;
  name: string;
  schema: string;
  tags: routineUpdate_routineUpdate_inputs_standard_tags[];
  translations: routineUpdate_routineUpdate_inputs_standard_translations[];
}

export interface routineUpdate_routineUpdate_inputs {
  __typename: "InputItem";
  id: string;
  standard: routineUpdate_routineUpdate_inputs_standard | null;
}

export interface routineUpdate_routineUpdate_nodeLinks_whens_translations {
  __typename: "NodeLinkWhenTranslation";
  id: string;
  language: string;
  description: string | null;
  title: string;
}

export interface routineUpdate_routineUpdate_nodeLinks_whens {
  __typename: "NodeLinkWhen";
  id: string;
  condition: string;
  translations: routineUpdate_routineUpdate_nodeLinks_whens_translations[];
}

export interface routineUpdate_routineUpdate_nodeLinks {
  __typename: "NodeLink";
  id: string;
  fromId: string;
  toId: string;
  whens: routineUpdate_routineUpdate_nodeLinks_whens[];
}

export interface routineUpdate_routineUpdate_nodes_data_NodeEnd {
  __typename: "NodeEnd";
  id: string;
  wasSuccessful: boolean;
}

export interface routineUpdate_routineUpdate_nodes_data_NodeRoutineList_routines_routine_owner_Organization_translations {
  __typename: "OrganizationTranslation";
  id: string;
  language: string;
  name: string;
}

export interface routineUpdate_routineUpdate_nodes_data_NodeRoutineList_routines_routine_owner_Organization {
  __typename: "Organization";
  id: string;
  translations: routineUpdate_routineUpdate_nodes_data_NodeRoutineList_routines_routine_owner_Organization_translations[];
}

export interface routineUpdate_routineUpdate_nodes_data_NodeRoutineList_routines_routine_owner_User {
  __typename: "User";
  id: string;
  username: string | null;
}

export type routineUpdate_routineUpdate_nodes_data_NodeRoutineList_routines_routine_owner = routineUpdate_routineUpdate_nodes_data_NodeRoutineList_routines_routine_owner_Organization | routineUpdate_routineUpdate_nodes_data_NodeRoutineList_routines_routine_owner_User;

export interface routineUpdate_routineUpdate_nodes_data_NodeRoutineList_routines_routine_translations {
  __typename: "RoutineTranslation";
  id: string;
  language: string;
  title: string;
  description: string | null;
  instructions: string;
}

export interface routineUpdate_routineUpdate_nodes_data_NodeRoutineList_routines_routine {
  __typename: "Routine";
  id: string;
  complexity: number;
  isInternal: boolean | null;
  nodesCount: number | null;
  role: MemberRole | null;
  owner: routineUpdate_routineUpdate_nodes_data_NodeRoutineList_routines_routine_owner | null;
  simplicity: number;
  translations: routineUpdate_routineUpdate_nodes_data_NodeRoutineList_routines_routine_translations[];
  version: string | null;
}

export interface routineUpdate_routineUpdate_nodes_data_NodeRoutineList_routines_translations {
  __typename: "NodeRoutineListItemTranslation";
  id: string;
  language: string;
  description: string | null;
  title: string | null;
}

export interface routineUpdate_routineUpdate_nodes_data_NodeRoutineList_routines {
  __typename: "NodeRoutineListItem";
  id: string;
  index: number;
  isOptional: boolean;
  routine: routineUpdate_routineUpdate_nodes_data_NodeRoutineList_routines_routine;
  translations: routineUpdate_routineUpdate_nodes_data_NodeRoutineList_routines_translations[];
}

export interface routineUpdate_routineUpdate_nodes_data_NodeRoutineList {
  __typename: "NodeRoutineList";
  id: string;
  isOptional: boolean;
  isOrdered: boolean;
  routines: routineUpdate_routineUpdate_nodes_data_NodeRoutineList_routines[];
}

export type routineUpdate_routineUpdate_nodes_data = routineUpdate_routineUpdate_nodes_data_NodeEnd | routineUpdate_routineUpdate_nodes_data_NodeRoutineList;

export interface routineUpdate_routineUpdate_nodes_loop_whiles_translations {
  __typename: "LoopWhileTranslation";
  id: string;
  language: string;
  description: string | null;
  title: string;
}

export interface routineUpdate_routineUpdate_nodes_loop_whiles {
  __typename: "LoopWhile";
  id: string;
  condition: string;
  translations: routineUpdate_routineUpdate_nodes_loop_whiles_translations[];
}

export interface routineUpdate_routineUpdate_nodes_loop {
  __typename: "Loop";
  id: string;
  loops: number | null;
  maxLoops: number | null;
  operation: string | null;
  whiles: routineUpdate_routineUpdate_nodes_loop_whiles[];
}

export interface routineUpdate_routineUpdate_nodes_translations {
  __typename: "NodeTranslation";
  id: string;
  language: string;
  description: string | null;
  title: string;
}

export interface routineUpdate_routineUpdate_nodes {
  __typename: "Node";
  id: string;
  columnIndex: number | null;
  created_at: any;
  rowIndex: number | null;
  type: NodeType;
  updated_at: any;
  data: routineUpdate_routineUpdate_nodes_data | null;
  loop: routineUpdate_routineUpdate_nodes_loop | null;
  translations: routineUpdate_routineUpdate_nodes_translations[];
}

export interface routineUpdate_routineUpdate_outputs_standard_tags_translations {
  __typename: "TagTranslation";
  id: string;
  language: string;
  description: string | null;
}

export interface routineUpdate_routineUpdate_outputs_standard_tags {
  __typename: "Tag";
  id: string;
  tag: string;
  translations: routineUpdate_routineUpdate_outputs_standard_tags_translations[];
}

export interface routineUpdate_routineUpdate_outputs_standard_translations {
  __typename: "StandardTranslation";
  id: string;
  language: string;
  description: string | null;
}

export interface routineUpdate_routineUpdate_outputs_standard {
  __typename: "Standard";
  id: string;
  default: string | null;
  isFile: boolean;
  name: string;
  schema: string;
  tags: routineUpdate_routineUpdate_outputs_standard_tags[];
  translations: routineUpdate_routineUpdate_outputs_standard_translations[];
}

export interface routineUpdate_routineUpdate_outputs {
  __typename: "OutputItem";
  id: string;
  standard: routineUpdate_routineUpdate_outputs_standard | null;
}

export interface routineUpdate_routineUpdate_owner_Organization_translations {
  __typename: "OrganizationTranslation";
  id: string;
  language: string;
  name: string;
}

export interface routineUpdate_routineUpdate_owner_Organization {
  __typename: "Organization";
  id: string;
  translations: routineUpdate_routineUpdate_owner_Organization_translations[];
}

export interface routineUpdate_routineUpdate_owner_User {
  __typename: "User";
  id: string;
  username: string | null;
}

export type routineUpdate_routineUpdate_owner = routineUpdate_routineUpdate_owner_Organization | routineUpdate_routineUpdate_owner_User;

export interface routineUpdate_routineUpdate_parent_translations {
  __typename: "RoutineTranslation";
  id: string;
  language: string;
  title: string;
}

export interface routineUpdate_routineUpdate_parent {
  __typename: "Routine";
  id: string;
  translations: routineUpdate_routineUpdate_parent_translations[];
}

export interface routineUpdate_routineUpdate_resourceLists_translations {
  __typename: "ResourceListTranslation";
  id: string;
  language: string;
  description: string | null;
  title: string | null;
}

export interface routineUpdate_routineUpdate_resourceLists_resources_translations {
  __typename: "ResourceTranslation";
  id: string;
  language: string;
  description: string | null;
  title: string | null;
}

export interface routineUpdate_routineUpdate_resourceLists_resources {
  __typename: "Resource";
  id: string;
  created_at: any;
  index: number | null;
  link: string;
  updated_at: any;
  usedFor: ResourceUsedFor | null;
  translations: routineUpdate_routineUpdate_resourceLists_resources_translations[];
}

export interface routineUpdate_routineUpdate_resourceLists {
  __typename: "ResourceList";
  id: string;
  created_at: any;
  index: number | null;
  usedFor: ResourceListUsedFor | null;
  translations: routineUpdate_routineUpdate_resourceLists_translations[];
  resources: routineUpdate_routineUpdate_resourceLists_resources[];
}

export interface routineUpdate_routineUpdate_tags_translations {
  __typename: "TagTranslation";
  id: string;
  language: string;
  description: string | null;
}

export interface routineUpdate_routineUpdate_tags {
  __typename: "Tag";
  id: string;
  tag: string;
  translations: routineUpdate_routineUpdate_tags_translations[];
}

export interface routineUpdate_routineUpdate_translations {
  __typename: "RoutineTranslation";
  id: string;
  language: string;
  description: string | null;
  instructions: string;
  title: string;
}

export interface routineUpdate_routineUpdate {
  __typename: "Routine";
  id: string;
  completedAt: any | null;
  complexity: number;
  created_at: any;
  inputs: routineUpdate_routineUpdate_inputs[];
  isAutomatable: boolean | null;
  isComplete: boolean;
  isInternal: boolean | null;
  isStarred: boolean;
  isUpvoted: boolean | null;
  nodeLinks: routineUpdate_routineUpdate_nodeLinks[];
  nodes: routineUpdate_routineUpdate_nodes[];
  outputs: routineUpdate_routineUpdate_outputs[];
  owner: routineUpdate_routineUpdate_owner | null;
  parent: routineUpdate_routineUpdate_parent | null;
  resourceLists: routineUpdate_routineUpdate_resourceLists[];
  score: number;
  simplicity: number;
  stars: number;
  role: MemberRole | null;
  tags: routineUpdate_routineUpdate_tags[];
  translations: routineUpdate_routineUpdate_translations[];
  updated_at: any;
  version: string | null;
}

export interface routineUpdate {
  routineUpdate: routineUpdate_routineUpdate;
}

export interface routineUpdateVariables {
  input: RoutineUpdateInput;
}
