import { ProjectCreateInput, ProjectTranslationCreateInput, ProjectTranslationUpdateInput, ProjectUpdateInput } from "graphql/generated/globalTypes";
import { ShapeWrapper, Project, ProjectTranslation } from "types";
import { hasObjectChanged, ObjectType, ResourceListShape, shapeResourceListsCreate, shapeResourceListsUpdate, shapeTagsCreate, shapeTagsUpdate, TagShape } from "utils";
import { shapeCreateList, shapeUpdate, shapeUpdateList } from "./shapeTools";

export type ProjectTranslationShape = Omit<ShapeWrapper<ProjectTranslation>, 'language' | 'name'> & {
    id: string;
    language: ProjectTranslationCreateInput['language'];
    name: ProjectTranslationCreateInput['name'];
}

export type ProjectShape = Omit<ShapeWrapper<Project>, 'resourceLists' | 'tags' | 'translations' | 'owner'> & {
    id: string;
    // handle: string | null; TODO
    resourceLists?: ResourceListShape[] | null;
    tags?: TagShape[];
    translations: ProjectTranslationShape[];
    parent?: {
        id: string
    } | null;
    owner?: {
        __typename: 'User' | 'Organization';
        id: string;
    } | null;
}

export const shapeProjectTranslationCreate = (item: ProjectTranslationShape): ProjectTranslationCreateInput => ({
    id: item.id,
    language: item.language,
    name: item.name,
    description: item.description,
})

export const shapeProjectTranslationUpdate = (
    original: ProjectTranslationShape,
    updated: ProjectTranslationShape
): ProjectTranslationUpdateInput | undefined =>
    shapeUpdate(original, updated, (o, u) => ({
        id: u.id,
        name: u.name !== o.name ? u.name : undefined,
        description: u.description !== o.description ? u.description : undefined,
    }))

export const shapeProjectTranslationsCreate = (items: ProjectTranslationShape[] | null | undefined): {
    translationsCreate?: ProjectTranslationCreateInput[],
} => shapeCreateList(items, 'translations', shapeProjectTranslationCreate);

export const shapeProjectTranslationsUpdate = (
    o: ProjectTranslationShape[] | null | undefined,
    u: ProjectTranslationShape[] | null | undefined
): {
    translationsCreate?: ProjectTranslationCreateInput[],
    translationsUpdate?: ProjectTranslationUpdateInput[],
    translationsDelete?: string[],
} => shapeUpdateList(o, u, 'translations', hasObjectChanged, shapeProjectTranslationCreate, shapeProjectTranslationUpdate)

export const shapeProjectCreate = (item: ProjectShape): ProjectCreateInput => ({
    id: item.id,
    // TODO handle
    isComplete: item.isComplete,
    parentId: item.parent?.id,
    createdByUserId: item.owner?.__typename === ObjectType.User ? item.owner.id : undefined,
    createdByOrganizationId: item.owner?.__typename === ObjectType.Organization ? item.owner.id : undefined,
    ...shapeProjectTranslationsCreate(item.translations),
    ...shapeResourceListsCreate(item.resourceLists),
    ...shapeTagsCreate(item.tags ?? []),
})

export const shapeProjectUpdate = (
    original: ProjectShape,
    updated: ProjectShape
): ProjectUpdateInput | undefined =>
    shapeUpdate(original, updated, (o, u) => ({
        id: o.id,
        //TODO handle
        isComplete: u.isComplete !== o.isComplete ? u.isComplete : undefined,
        userId: u.owner?.__typename === ObjectType.User ? u.owner.id : undefined,
        organizationId: u.owner?.__typename === ObjectType.Organization ? u.owner.id : undefined,
        ...shapeProjectTranslationsUpdate(o.translations, u.translations),
        ...shapeResourceListsUpdate(o.resourceLists, u.resourceLists),
        ...shapeTagsUpdate(o.tags, u.tags),
    }))