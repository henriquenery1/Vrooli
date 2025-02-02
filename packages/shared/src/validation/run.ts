import { id, idArray, title } from './base';
import { runInputsCreate, runInputsUpdate } from './runInputs';
import { stepsCreate, stepsUpdate } from './step';
import * as yup from 'yup';

const version = yup.string().max(16);
const completedComplexity = yup.number().integer().min(0);
const contextSwitches = yup.number().integer().min(0);
const timeElapsed = yup.number().integer().min(0);
const isPrivate = yup.boolean();

export const runCreate = yup.object().shape({
    id: id.required(),
    isPrivate: isPrivate.notRequired().default(undefined),
    routineId: id.required(),
    title: title.required(),
    version: version.required(),
})

export const runUpdate = yup.object().shape({
    id: id.required(),
    completedComplexity: completedComplexity.notRequired().default(undefined),
    contextSwitches: contextSwitches.notRequired().default(undefined),
    isPrivate: isPrivate.notRequired().default(undefined),
    timeElapsed: timeElapsed.notRequired().default(undefined),
    stepsCreate: stepsCreate.notRequired().default(undefined),
    stepsUpdate: stepsUpdate.notRequired().default(undefined),
    stepsDelete: idArray.notRequired().default(undefined),
    inputsCreate: runInputsCreate.notRequired().default(undefined),
    inputsUpdate: runInputsUpdate.notRequired().default(undefined),
    inputsDelete: idArray.notRequired().default(undefined),
})

export const runsCreate = yup.array().of(runCreate.required())
export const runsUpdate = yup.array().of(runUpdate.required())