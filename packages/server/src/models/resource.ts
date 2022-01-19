import { ResourceFor } from "@local/shared";
import { PrismaSelect } from "@paljs/plugins";
import { Organization, Project, Resource, ResourceCountInput, ResourceInput, ResourceSearchInput, ResourceSortBy, Routine, User } from "../schema/types";
import { PrismaType, RecursivePartial } from "types";
import { counter, deleter, findByIder, FormatConverter, MODEL_TYPES, searcher, Sortable } from "./base";

//======================================================================================================================
/* #region Type Definitions */
//======================================================================================================================

// Type 1. RelationshipList
export type ResourceRelationshipList = 'organization_resources' | 'project_resources' | 'routine_resources_contextual' |
    'routine_resources_external' | 'user_resources';
// Type 2. QueryablePrimitives
export type ResourceQueryablePrimitives = Omit<Resource, ResourceRelationshipList>;
// Type 3. AllPrimitives
export type ResourceAllPrimitives = ResourceQueryablePrimitives;
// type 4. Database shape
export type ResourceDB = ResourceAllPrimitives &
{
    organization_resources: { organization: Organization },
    project_resources: { project: Project },
    routine_resources_contextual: { routine: Routine },
    routine_resources_external: { routine: Routine },
    user_resources: { user: User },
};

//======================================================================================================================
/* #endregion Type Definitions */
//======================================================================================================================

//==============================================================
/* #region Custom Components */
//==============================================================

// Maps routine apply types to the correct prisma join tables
const applyMap = {
    [ResourceFor.Organization]: 'organizationResources',
    [ResourceFor.Project]: 'projectResources',
    [ResourceFor.RoutineContextual]: 'routineResourcesContextual',
    [ResourceFor.RoutineExternal]: 'routineResourcesExternal',
    [ResourceFor.User]: 'userResources',
}

/**
 * Component for formatting between graphql and prisma types
 */
export const resourceFormatter = (): FormatConverter<Resource, ResourceDB> => ({
    toDB: (obj: RecursivePartial<Resource>): RecursivePartial<ResourceDB> => (obj as any), //TODO
    toGraphQL: (obj: RecursivePartial<ResourceDB>): RecursivePartial<Resource> => (obj as any) //TODO
})

/**
 * Custom compositional component for creating resources
 * @param state 
 * @returns 
 */
export const resourceCreater = (prisma: PrismaType) => ({
    /**
    * Applies a resource object to an actor, project, organization, or routine
    * @param resource 
    * @returns
    */
    async applyToObject(resource: any, createdFor: keyof typeof applyMap, forId: string): Promise<any> {
        return await (prisma[applyMap[createdFor] as keyof PrismaType] as any).create({
            data: {
                forId,
                resourceId: resource.id
            }
        })
    },
    async create(data: ResourceInput, info: any): Promise<RecursivePartial<ResourceDB>> {
        // Filter out for and forId, since they are not part of the resource object
        const { createdFor, forId, ...resourceData } = data;
        // Create base object
        const resource = await prisma.resource.create({ data: resourceData as any });
        // Create join object
        await this.applyToObject(resource, createdFor, forId);
        // Return query
        return await prisma.resource.findFirst({ where: { id: resource.id }, ...(new PrismaSelect(info).value) }) as any;
    }
})

/**
 * Custom compositional component for updating resources
 * @param state 
 * @returns 
 */
const resourceUpdater = (prisma: PrismaType) => ({
    async update(data: ResourceInput, info: any): Promise<ResourceDB> {
        // Filter out for and forId, since they are not part of the resource object
        const { createdFor, forId, ...resourceData } = data;
        // Check if resource needs to be associated with another object instead
        //TODO
        // Update base object and return query
        return await prisma.resource.update({
            where: { id: data.id },
            data: resourceData,
            ...(new PrismaSelect(info).value)
        }) as any;
    }
})

/**
 * Component for search filters
 */
export const resourceSorter = (): Sortable<ResourceSortBy> => ({
    defaultSort: ResourceSortBy.AlphabeticalDesc,
    getSortQuery: (sortBy: string): any => {
        return {
            [ResourceSortBy.AlphabeticalAsc]: { title: 'asc' },
            [ResourceSortBy.AlphabeticalDesc]: { title: 'desc' },
            [ResourceSortBy.DateCreatedAsc]: { created_at: 'asc' },
            [ResourceSortBy.DateCreatedDesc]: { created_at: 'desc' },
            [ResourceSortBy.DateUpdatedAsc]: { updated_at: 'asc' },
            [ResourceSortBy.DateUpdatedDesc]: { updated_at: 'desc' },
        }[sortBy]
    },
    getSearchStringQuery: (searchString: string): any => {
        const insensitive = ({ contains: searchString.trim(), mode: 'insensitive' });
        return ({
            OR: [
                { title: { ...insensitive } },
                { description: { ...insensitive } },
                { link: { ...insensitive } },
                { displayUrl: { ...insensitive } },
            ]
        })
    }
})

//==============================================================
/* #endregion Custom Components */
//==============================================================

//==============================================================
/* #region Model */
//==============================================================

export function ResourceModel(prisma: PrismaType) {
    const model = MODEL_TYPES.Resource;
    const format = resourceFormatter();
    const sort = resourceSorter();

    return {
        model,
        prisma,
        ...format,
        ...sort,
        ...counter<ResourceCountInput>(model, prisma),
        ...deleter(model, prisma),
        ...findByIder<Resource, ResourceDB>(model, format.toDB, prisma),
        ...resourceCreater(prisma),
        ...resourceUpdater(prisma),
        ...searcher<ResourceSortBy, ResourceSearchInput, Resource, ResourceDB>(model, format.toDB, format.toGraphQL, sort, prisma),
    }
}

//==============================================================
/* #endregion Model */
//==============================================================