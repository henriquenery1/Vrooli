import { CODE, resourceListCreate, resourceListTranslationsCreate, resourceListTranslationsUpdate, resourceListUpdate } from "@local/shared";
import { ResourceList, ResourceListCreateInput, ResourceListUpdateInput, Count, ResourceListSortBy, ResourceListSearchInput } from "../schema/types";
import { PrismaType } from "types";
import { CUDInput, CUDResult, FormatConverter, GraphQLModelType, modelToGraphQL, relationshipToPrisma, RelationshipTypes, Searcher, selectHelper, ValidateMutationsInput } from "./base";
import { CustomError } from "../error";
import _ from "lodash";
import { TranslationModel } from "./translation";
import { ResourceModel } from "./resource";

//==============================================================
/* #region Custom Components */
//==============================================================

export const resourceListFormatter = (): FormatConverter<ResourceList> => ({
    relationshipMap: {
        '__typename': GraphQLModelType.ResourceList,
        'resources': GraphQLModelType.Resource,
    },
})

export const resourceListSearcher = (): Searcher<ResourceListSearchInput> => ({
    defaultSort: ResourceListSortBy.IndexAsc,
    getSortQuery: (sortBy: string): any => {
        return {
            [ResourceListSortBy.DateCreatedAsc]: { created_at: 'asc' },
            [ResourceListSortBy.DateCreatedDesc]: { created_at: 'desc' },
            [ResourceListSortBy.DateUpdatedAsc]: { updated_at: 'asc' },
            [ResourceListSortBy.DateUpdatedDesc]: { updated_at: 'desc' },
            [ResourceListSortBy.IndexAsc]: { index: 'asc' },
            [ResourceListSortBy.IndexDesc]: { index: 'desc' },
        }[sortBy]
    },
    getSearchStringQuery: (searchString: string, languages?: string[]): any => {
        const insensitive = ({ contains: searchString.trim(), mode: 'insensitive' });
        return ({
            OR: [
                { translations: { some: { language: languages ? { in: languages } : undefined, description: { ...insensitive } } } },
                { translations: { some: { language: languages ? { in: languages } : undefined, title: { ...insensitive } } } },
            ]
        })
    },
    customQueries(input: ResourceListSearchInput): { [x: string]: any } {
        const languagesQuery = input.languages ? { translations: { some: { language: { in: input.languages } } } } : {};
        return { ...languagesQuery };
    },
})

export const resourceListMutater = (prisma: PrismaType) => ({
    async toDBShape(userId: string | null, data: ResourceListCreateInput | ResourceListUpdateInput, isAdd: boolean): Promise<any> {
        return {
            id: (data as ResourceListUpdateInput)?.id ?? undefined,
            organizationId: data.organizationId ?? undefined,
            projectId: data.projectId ?? undefined,
            routineId: data.routineId ?? undefined,
            userId: data.userId ?? undefined,
            resources: ResourceModel(prisma).relationshipBuilder(userId, data, isAdd),
            translations: TranslationModel().relationshipBuilder(userId, data, { create: resourceListTranslationsCreate, update: resourceListTranslationsUpdate }, isAdd),
        };
    },
    async relationshipBuilder(
        userId: string | null,
        input: { [x: string]: any },
        isAdd: boolean = true,
        relationshipName: string = 'resourceLists',
    ): Promise<{ [x: string]: any } | undefined> {
        console.log('in resource LIST relationshipbuilder start')
        const fieldExcludes = ['createdFor', 'createdForId'];
        // Convert input to Prisma shape. Also remove anything that's not an create, update, or delete, as connect/disconnect
        // are not supported by resource lists (since they can only be applied to one object)
        let formattedInput = relationshipToPrisma({ data: input, relationshipName, isAdd, fieldExcludes, relExcludes: [RelationshipTypes.connect, RelationshipTypes.disconnect] })
        // Validate
        const { create: createMany, update: updateMany, delete: deleteMany } = formattedInput;
        console.log('in resource LIST relationshipbuilder formattedInput. going to validate...', formattedInput)
        await this.validateMutations({
            userId,
            createMany: createMany as ResourceListCreateInput[],
            updateMany: updateMany as { where: { id: string }, data: ResourceListUpdateInput }[],
            deleteMany: deleteMany?.map(d => d.id)
        });
        // Shape
        if (Array.isArray(formattedInput.create)) {
            // If title or description is not provided, try querying for the link's og tags TODO
            formattedInput.create = formattedInput.create.map(async (data) => await this.toDBShape(userId, data as any, true));
        }
        if (Array.isArray(formattedInput.update)) {
            formattedInput.update = formattedInput.update.map(async (data) => ({
                where: data.where,
                data: await this.toDBShape(userId, data.data as any, false)
            }))
        }
        return Object.keys(formattedInput).length > 0 ? formattedInput : undefined;
    },
    async validateMutations({
        userId, createMany, updateMany, deleteMany
    }: ValidateMutationsInput<ResourceListCreateInput, ResourceListUpdateInput>): Promise<void> {
        if ((createMany || updateMany || deleteMany) && !userId) throw new CustomError(CODE.Unauthorized, 'User must be logged in to perform CRUD operations');
        console.log('in resource LIST validateMutations...')
        // TODO check that user can add resource to this forId, like in node validateMutations
        if (createMany) {
            console.log('node validate createMany', createMany);
            createMany.forEach(input => resourceListCreate.validateSync(input, { abortEarly: false }));
            createMany.forEach(input => TranslationModel().profanityCheck(input));
            // Check for max resources on object TODO
        }
        if (updateMany) {
            console.log('node validate updateMany', updateMany);
            updateMany.forEach(input => resourceListUpdate.validateSync(input.data, { abortEarly: false }));
            updateMany.forEach(input => TranslationModel().profanityCheck(input.data));
        }
        console.log('finishedd resource LIST validateMutations :)')
    },
    async cud({ partial, userId, createMany, updateMany, deleteMany }: CUDInput<ResourceListCreateInput, ResourceListUpdateInput>): Promise<CUDResult<ResourceList>> {
        await this.validateMutations({ userId, createMany, updateMany, deleteMany });
        // Perform mutations
        let created: any[] = [], updated: any[] = [], deleted: Count = { count: 0 };
        if (createMany) {
            // Loop through each create input
            for (const input of createMany) {
                // If title or description is not provided, try querying for the link's og tags TODO
                // Call createData helper function
                const data = await this.toDBShape(userId, input, true);
                // Create object
                const currCreated = await prisma.resource_list.create({ data, ...selectHelper(partial) });
                // Convert to GraphQL
                const converted = modelToGraphQL(currCreated, partial);
                // Add to created array
                created = created ? [...created, converted] : [converted];
            }
        }
        if (updateMany) {
            // Loop through each update input
            for (const input of updateMany) {
                // Find in database
                let object = await prisma.report.findFirst({
                    where: { ...input.where, userId }
                })
                if (!object) throw new CustomError(CODE.ErrorUnknown);
                // Update object
                const currUpdated = await prisma.resource_list.update({
                    where: input.where,
                    data: await this.toDBShape(userId, input.data, false),
                    ...selectHelper(partial)
                });
                // Convert to GraphQL
                const converted = modelToGraphQL(currUpdated, partial);
                // Add to updated array
                updated = updated ? [...updated, converted] : [converted];
            }
        }
        if (deleteMany) {
            deleted = await prisma.report.deleteMany({
                where: {
                    AND: [
                        { id: { in: deleteMany } },
                        { userId },
                    ]
                }
            })
        }
        return {
            created: createMany ? created : undefined,
            updated: updateMany ? updated : undefined,
            deleted: deleteMany ? deleted : undefined,
        };
    },
})

//==============================================================
/* #endregion Custom Components */
//==============================================================

//==============================================================
/* #region Model */
//==============================================================

export function ResourceListModel(prisma: PrismaType) {
    const prismaObject = prisma.resource_list;
    const format = resourceListFormatter();
    const search = resourceListSearcher();
    const mutate = resourceListMutater(prisma);

    return {
        prisma,
        prismaObject,
        ...format,
        ...search,
        ...mutate,
    }
}

//==============================================================
/* #endregion Model */
//==============================================================