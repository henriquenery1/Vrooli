/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { NodeUpdateInput, NodeType } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: nodeUpdate
// ====================================================

export interface nodeUpdate_nodeUpdate_data_NodeCombine {
  __typename: "NodeCombine";
  id: string;
  from: string[];
  toId: string;
}

export interface nodeUpdate_nodeUpdate_data_NodeDecision_decisions_when {
  __typename: "NodeDecisionItemWhen";
  id: string;
  condition: string;
}

export interface nodeUpdate_nodeUpdate_data_NodeDecision_decisions {
  __typename: "NodeDecisionItem";
  id: string;
  description: string | null;
  title: string;
  toId: string | null;
  when: nodeUpdate_nodeUpdate_data_NodeDecision_decisions_when[];
}

export interface nodeUpdate_nodeUpdate_data_NodeDecision {
  __typename: "NodeDecision";
  id: string;
  decisions: nodeUpdate_nodeUpdate_data_NodeDecision_decisions[];
}

export interface nodeUpdate_nodeUpdate_data_NodeEnd {
  __typename: "NodeEnd";
  id: string;
  wasSuccessful: boolean;
}

export interface nodeUpdate_nodeUpdate_data_NodeLoop {
  __typename: "NodeLoop";
  id: string;
}

export interface nodeUpdate_nodeUpdate_data_NodeRoutineList_routines_routine_tags {
  __typename: "Tag";
  id: string;
  tag: string;
  description: string | null;
  created_at: any;
  stars: number;
  isStarred: boolean | null;
}

export interface nodeUpdate_nodeUpdate_data_NodeRoutineList_routines_routine {
  __typename: "Routine";
  id: string;
  version: string | null;
  title: string | null;
  description: string | null;
  created_at: any;
  isAutomatable: boolean | null;
  tags: nodeUpdate_nodeUpdate_data_NodeRoutineList_routines_routine_tags[];
  stars: number;
  isStarred: boolean | null;
  score: number;
  isUpvoted: boolean | null;
}

export interface nodeUpdate_nodeUpdate_data_NodeRoutineList_routines {
  __typename: "NodeRoutineListItem";
  id: string;
  title: string | null;
  description: string | null;
  isOptional: boolean;
  routine: nodeUpdate_nodeUpdate_data_NodeRoutineList_routines_routine;
}

export interface nodeUpdate_nodeUpdate_data_NodeRoutineList {
  __typename: "NodeRoutineList";
  id: string;
  isOptional: boolean;
  isOrdered: boolean;
  routines: nodeUpdate_nodeUpdate_data_NodeRoutineList_routines[];
}

export type nodeUpdate_nodeUpdate_data = nodeUpdate_nodeUpdate_data_NodeCombine | nodeUpdate_nodeUpdate_data_NodeDecision | nodeUpdate_nodeUpdate_data_NodeEnd | nodeUpdate_nodeUpdate_data_NodeLoop | nodeUpdate_nodeUpdate_data_NodeRoutineList;

export interface nodeUpdate_nodeUpdate {
  __typename: "Node";
  id: string;
  created_at: any;
  description: string | null;
  next: string | null;
  previous: string | null;
  title: string;
  type: NodeType;
  updated_at: any;
  data: nodeUpdate_nodeUpdate_data | null;
}

export interface nodeUpdate {
  nodeUpdate: nodeUpdate_nodeUpdate;
}

export interface nodeUpdateVariables {
  input: NodeUpdateInput;
}
