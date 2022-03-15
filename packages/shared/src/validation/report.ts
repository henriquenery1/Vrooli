import { id, language } from './base';
import * as yup from 'yup';
import { ReportFor } from '../consts';

const createdFor = yup.string().oneOf(Object.values(ReportFor))
const details = yup.string().max(1024)
const reason = yup.string().min(1).max(128)

/**
 * Information required when creating a comment
 */
export const reportCreate = yup.object().shape({
    createdFor: createdFor.required(),
    createdForId: id.required(),
    details: details.notRequired().default(undefined),
    language: language.required(),
    reason: reason.required(),
})

/**
 * Information required when updating an organization
 */
export const reportUpdate = yup.object().shape({
    id: id.required(),
    details: details.notRequired().default(undefined),
    language: language.notRequired().default(undefined),
    reason: reason.notRequired().default(undefined),
})