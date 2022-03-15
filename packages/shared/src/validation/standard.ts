import { description, idArray, id, name, version, language } from './base';
import { tagsCreate } from './tag';
import * as yup from 'yup';
import { StandardType } from '../consts';

const standardDefault = yup.string().max(1024)
const schema = yup.string().max(8192).required();
const type = yup.string().oneOf(Object.values(StandardType))

export const standardTranslationCreate = yup.object().shape({
    language: language.required(),
    description: description.required(),
});
export const standardTranslationUpdate = yup.object().shape({
    id: id.required(),
    language: language.notRequired().default(undefined),
    description: description.notRequired().default(undefined),
});
export const standardTranslationsCreate = yup.array().of(standardTranslationCreate.required())
export const standardTranslationsUpdate = yup.array().of(standardTranslationUpdate.required())

export const standardCreateForm = yup.object().shape({
    default: standardDefault.notRequired().default(undefined),
    description: description.notRequired().default(undefined),
    name: name.required(),
    schema: schema.notRequired().default(undefined),
    type: type.required(),
    version: version.notRequired().default(undefined),
})
/**
 * Information required when creating a standard. 
 */
export const standardCreate = yup.object().shape({
    default: standardDefault.notRequired().default(undefined),
    isFile: yup.boolean().notRequired().default(undefined),
    name: name.required(),
    schema: schema.notRequired().default(undefined),
    type: type.required(),
    version: version.notRequired().default(undefined),
    createdByUserId: id.notRequired().default(undefined), // If associating with yourself, your own id. Cannot associate with another user
    createdByOrganizationId: id.notRequired().default(undefined), // If associating with an organization you are an admin of, the organization's id
    tagsConnect: idArray.notRequired().default(undefined),
    tagsCreate: tagsCreate.notRequired().default(undefined),
    translationsCreate: standardTranslationsCreate.notRequired().default(undefined),
})

/**
 * Information required when updating a routine
 */
export const standardUpdate = yup.object().shape({
    id: id.required(),
    makingAnonymous: yup.boolean().notRequired().default(undefined), // If you want the standard to be made anonymous
    tagsConnect: idArray.notRequired().default(undefined),
    tagsDisconnect: idArray.notRequired().default(undefined),
    tagsCreate: tagsCreate.notRequired().default(undefined),
    translationsDelete: idArray.notRequired().default(undefined),
    translationsCreate: standardTranslationsCreate.notRequired().default(undefined),
    translationsUpdate: standardTranslationsUpdate.notRequired().default(undefined),
})

export const standardsCreate = yup.array().of(standardCreate.required())
export const standardsUpdate = yup.array().of(standardUpdate.required())