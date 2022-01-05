/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { FindByIdInput, StandardType, NodeType } from "./globalTypes";

// ====================================================
// GraphQL query operation: routine
// ====================================================

export interface routine_routine_tags {
  __typename: "Tag";
  id: string;
  tag: string;
  description: string | null;
  created_at: any;
}

export interface routine_routine_inputs_routine_tags {
  __typename: "Tag";
  id: string;
  tag: string;
  description: string | null;
  created_at: any;
}

export interface routine_routine_inputs_routine {
  __typename: "Routine";
  id: string;
  version: string | null;
  title: string | null;
  description: string | null;
  created_at: any;
  isAutomatable: boolean | null;
  tags: routine_routine_inputs_routine_tags[];
}

export interface routine_routine_inputs_standard_tags {
  __typename: "Tag";
  id: string;
  tag: string;
  description: string | null;
  created_at: any;
}

export interface routine_routine_inputs_standard {
  __typename: "Standard";
  id: string;
  name: string;
  description: string | null;
  type: StandardType;
  schema: string;
  default: string | null;
  isFile: boolean;
  created_at: any;
  tags: routine_routine_inputs_standard_tags[];
}

export interface routine_routine_inputs {
  __typename: "RoutineInputItem";
  routine: routine_routine_inputs_routine;
  standard: routine_routine_inputs_standard;
}

export interface routine_routine_outputs_routine_tags {
  __typename: "Tag";
  id: string;
  tag: string;
  description: string | null;
  created_at: any;
}

export interface routine_routine_outputs_routine {
  __typename: "Routine";
  id: string;
  version: string | null;
  title: string | null;
  description: string | null;
  created_at: any;
  isAutomatable: boolean | null;
  tags: routine_routine_outputs_routine_tags[];
}

export interface routine_routine_outputs_standard_tags {
  __typename: "Tag";
  id: string;
  tag: string;
  description: string | null;
  created_at: any;
}

export interface routine_routine_outputs_standard {
  __typename: "Standard";
  id: string;
  name: string;
  description: string | null;
  type: StandardType;
  schema: string;
  default: string | null;
  isFile: boolean;
  created_at: any;
  tags: routine_routine_outputs_standard_tags[];
}

export interface routine_routine_outputs {
  __typename: "RoutineOutputItem";
  routine: routine_routine_outputs_routine;
  standard: routine_routine_outputs_standard;
}

export interface routine_routine_nodes_data_NodeCombine {
  __typename: "NodeCombine";
  id: string;
  from: string[];
  to: string;
}

export interface routine_routine_nodes_data_NodeDecision_decisions_when {
  __typename: "NodeDecisionItemCase";
  id: string;
  condition: string;
}

export interface routine_routine_nodes_data_NodeDecision_decisions {
  __typename: "NodeDecisionItem";
  id: string;
  title: string;
  description: string | null;
  toId: string | null;
  when: (routine_routine_nodes_data_NodeDecision_decisions_when | null)[];
}

export interface routine_routine_nodes_data_NodeDecision {
  __typename: "NodeDecision";
  id: string;
  decisions: routine_routine_nodes_data_NodeDecision_decisions[];
}

export interface routine_routine_nodes_data_NodeEnd {
  __typename: "NodeEnd";
  id: string;
  wasSuccessful: boolean;
}

export interface routine_routine_nodes_data_NodeLoop {
  __typename: "NodeLoop";
  id: string;
}

export interface routine_routine_nodes_data_NodeRoutineList_routines_routine_tags {
  __typename: "Tag";
  id: string;
  tag: string;
  description: string | null;
  created_at: any;
}

export interface routine_routine_nodes_data_NodeRoutineList_routines_routine {
  __typename: "Routine";
  id: string;
  version: string | null;
  title: string | null;
  description: string | null;
  created_at: any;
  isAutomatable: boolean | null;
  tags: routine_routine_nodes_data_NodeRoutineList_routines_routine_tags[];
}

export interface routine_routine_nodes_data_NodeRoutineList_routines {
  __typename: "NodeRoutineListItem";
  id: string;
  title: string;
  description: string | null;
  isOptional: boolean;
  routine: routine_routine_nodes_data_NodeRoutineList_routines_routine | null;
}

export interface routine_routine_nodes_data_NodeRoutineList {
  __typename: "NodeRoutineList";
  id: string;
  isOrdered: boolean;
  isOptional: boolean;
  routines: routine_routine_nodes_data_NodeRoutineList_routines[];
}

export interface routine_routine_nodes_data_NodeRedirect {
  __typename: "NodeRedirect";
  id: string;
}

export interface routine_routine_nodes_data_NodeStart {
  __typename: "NodeStart";
  id: string;
}

export type routine_routine_nodes_data = routine_routine_nodes_data_NodeCombine | routine_routine_nodes_data_NodeDecision | routine_routine_nodes_data_NodeEnd | routine_routine_nodes_data_NodeLoop | routine_routine_nodes_data_NodeRoutineList | routine_routine_nodes_data_NodeRedirect | routine_routine_nodes_data_NodeStart;

export interface routine_routine_nodes {
  __typename: "Node";
  id: string;
  created_at: any;
  updated_at: any;
  routineId: string;
  title: string;
  description: string | null;
  type: NodeType;
  data: routine_routine_nodes_data | null;
  previous: string | null;
  next: string | null;
}

export interface routine_routine {
  __typename: "Routine";
  id: string;
  version: string | null;
  title: string | null;
  description: string | null;
  created_at: any;
  isAutomatable: boolean | null;
  tags: routine_routine_tags[];
  instructions: string | null;
  inputs: routine_routine_inputs[];
  outputs: routine_routine_outputs[];
  nodes: routine_routine_nodes[];
}

export interface routine {
  routine: routine_routine | null;
}

export interface routineVariables {
  input: FindByIdInput;
}
