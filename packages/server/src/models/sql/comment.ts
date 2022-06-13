import { CODE, commentCreate, commentsCreate, CommentSortBy, commentsUpdate, commentTranslationCreate, commentTranslationUpdate, commentUpdate } from "@local/shared";
import { CustomError } from "../../error";
import { Comment, CommentCreateInput, CommentFor, CommentSearchInput, CommentSearchResult, CommentThread, CommentUpdateInput, Count } from "../../schema/types";
import { PrismaType } from "types";
import { addCreatorField, addJoinTablesHelper, CUDInput, CUDResult, deconstructUnion, FormatConverter, removeCreatorField, removeJoinTablesHelper, selectHelper, modelToGraphQL, ValidateMutationsInput, Searcher, GraphQLModelType, PartialGraphQLInfo, PartialPrismaSelect, GraphQLInfo, toPartialGraphQLInfo, timeFrameToPrisma, PaginatedSearchResult, addSupplementalFields } from "./base";
import { organizationVerifier } from "./organization";
import pkg, { prisma } from '@prisma/client';
import { TranslationModel } from "./translation";
import { genErrorCode } from "../../logger";
import _ from "lodash";
const { MemberRole } = pkg;

//==============================================================
/* #region Custom Components */
//==============================================================

const joinMapper = { starredBy: 'user' };
const calculatedFields = ['isStarred', 'isUpvoted', 'role'];
export const commentFormatter = (): FormatConverter<Comment> => ({
    relationshipMap: {
        '__typename': GraphQLModelType.Comment,
        'creator': {
            'User': GraphQLModelType.User,
            'Organization': GraphQLModelType.Organization,
        },
        'commentedOn': {
            'Project': GraphQLModelType.Project,
            'Routine': GraphQLModelType.Routine,
            'Standard': GraphQLModelType.Standard,
        },
        'reports': GraphQLModelType.Report,
        'starredBy': GraphQLModelType.User,
        'votes': GraphQLModelType.Vote,
    },
    removeCalculatedFields: (partial) => {
        return _.omit(partial, calculatedFields);
    },
    constructUnions: (data) => {
        let { project, routine, standard, ...modified } = addCreatorField(data);
        if (project) modified.commentedOn = modified.project;
        else if (routine) modified.commentedOn = modified.routine;
        else if (standard) modified.commentedOn = modified.standard;
        return modified;
    },
    deconstructUnions: (partial) => {
        let modified = removeCreatorField(partial);
        modified = deconstructUnion(modified, 'commentedOn', [
            [GraphQLModelType.Project, 'project'],
            [GraphQLModelType.Routine, 'routine'],
            [GraphQLModelType.Standard, 'standard'],
        ]);
        return modified;
    },
    addJoinTables: (partial) => {
        return addJoinTablesHelper(partial, joinMapper);
    },
    removeJoinTables: (data) => {
        return removeJoinTablesHelper(data, joinMapper);
    },
})

export const commentSearcher = (): Searcher<CommentSearchInput> => ({
    defaultSort: CommentSortBy.VotesDesc,
    getSortQuery: (sortBy: string): any => {
        return {
            [CommentSortBy.DateCreatedAsc]: { created_at: 'asc' },
            [CommentSortBy.DateCreatedDesc]: { created_at: 'desc' },
            [CommentSortBy.DateUpdatedAsc]: { updated_at: 'asc' },
            [CommentSortBy.DateUpdatedDesc]: { updated_at: 'desc' },
            [CommentSortBy.StarsAsc]: { stars: 'asc' },
            [CommentSortBy.StarsDesc]: { stars: 'desc' },
            [CommentSortBy.VotesAsc]: { score: 'asc' },
            [CommentSortBy.VotesDesc]: { score: 'desc' },
        }[sortBy]
    },
    getSearchStringQuery: (searchString: string, languages?: string[]): any => {
        const insensitive = ({ contains: searchString.trim(), mode: 'insensitive' });
        return ({ translations: { some: { language: languages ? { in: languages } : undefined, text: { ...insensitive } } } });
    },
    customQueries(input: CommentSearchInput): { [x: string]: any } {
        return {
            ...(input.languages !== undefined ? { translations: { some: { language: { in: input.languages } } } } : {}),
            ...(input.minScore !== undefined ? { score: { gte: input.minScore } } : {}),
            ...(input.minStars !== undefined ? { stars: { gte: input.minStars } } : {}),
            ...(input.userId !== undefined ? { userId: input.userId } : {}),
            ...(input.organizationId !== undefined ? { organizationId: input.organizationId } : {}),
            ...(input.projectId !== undefined ? { projectId: input.projectId } : {}),
            ...(input.routineId !== undefined ? { routineId: input.routineId } : {}),
            ...(input.standardId !== undefined ? { standardId: input.standardId } : {}),
        }
    },
})

export const commentQuerier = (prisma: PrismaType) => ({
    /**
     * Custom search query for querying comment threads
     */
     async searchThreads(
        userId: string | null,
        input: { ids: string[], take: number, sortBy: CommentSortBy },
        info: GraphQLInfo | PartialGraphQLInfo,
        nestLimit: number = 2,
    ): Promise<CommentThread[]> {
        // Partially convert info type
        let partialInfo = toPartialGraphQLInfo(info, commentFormatter().relationshipMap);
        if (!partialInfo)
            throw new CustomError(CODE.InternalError, 'Could not convert info to partial select', { code: genErrorCode('0023') });
        // Create query for specified ids
        const idQuery = (Array.isArray(input.ids)) ? ({ id: { in: input.ids } }) : undefined;
        // Combine queries
        const where = { ...idQuery };
        // Determine sort order
        const orderBy = (commentSearcher() as any).getSortQuery(input.sortBy ?? commentSearcher().defaultSort);
        // Find requested search array
        const searchResults = await prisma.comment.findMany({
            where,
            orderBy,
            take: input.take ?? 10,
            ...selectHelper(partialInfo)
        });
        // If there are no results
        if (searchResults.length === 0) return [];
        // Initialize result 
        const threads: CommentThread[] = [];
        // For each result
        for (const result of searchResults) {
            // Find total in thread
            const totalInThread = await prisma.comment.count({
                where: {
                    ...where,
                    parentId: result.id,
                }
            });
            // Query for nested threads
            const nestedThreads = nestLimit > 0 ? await prisma.comment.findMany({
                where: {
                    ...where,
                    parentId: result.id,
                },
                take: input.take ?? 10,
                ...selectHelper(partialInfo)
            }) : [];
            // Find end cursor of nested threads
            const endCursor = nestedThreads.length > 0 ? nestedThreads[nestedThreads.length - 1].id : undefined;
            // For nested threads, recursively call this function
            const childThreads = nestLimit > 0 ? await this.searchThreads(userId, { 
                ids: nestedThreads.map(n => n.id), 
                take: input.take ?? 10, 
                sortBy: input.sortBy 
            }, info, nestLimit - 1) : [];
            // Add thread to result
            threads.push({
                childThreads,
                comment: result as any, //TODO need addsupplementalfields somewhere. Ideally one for all comments in all nest levels
                endCursor,
                totalInThread,
            });
        }
        // Return result
        return threads;
    },
    /**
     * Custom search query for comments. Searches n top-level comments 
     * (i.e. no parentId), n second-level comments (i.e. parentId equal to 
     * one of the top-level comments), and n third-level comments (i.e. 
     * parentId equal to one of the second-level comments).
     */
    async searchNested(
        userId: string | null,
        input: CommentSearchInput,
        info: GraphQLInfo | PartialGraphQLInfo,
        nestLimit: number = 2,
    ): Promise<CommentSearchResult> {
        // Partially convert info type
        let partialInfo = toPartialGraphQLInfo(info, commentFormatter().relationshipMap);
        if (!partialInfo)
            throw new CustomError(CODE.InternalError, 'Could not convert info to partial select', { code: genErrorCode('0023') });
        // Determine text search query
        const searchQuery = input.searchString ? (commentSearcher() as any).getSearchStringQuery(input.searchString) : undefined;
        // Determine createdTimeFrame query
        const createdQuery = timeFrameToPrisma('created_at', input.createdTimeFrame);
        // Determine updatedTimeFrame query
        const updatedQuery = timeFrameToPrisma('updated_at', input.updatedTimeFrame);
        // Create type-specific queries
        let typeQuery = (commentSearcher() as any).customQueries(input);
        // Combine queries
        const where = { ...searchQuery, ...createdQuery, ...updatedQuery, ...typeQuery };
        // Determine sort order
        const orderBy = (commentSearcher() as any).getSortQuery(input.sortBy ?? commentSearcher().defaultSort);
        // Find requested search array
        const searchResults = await prisma.comment.findMany({
            where,
            orderBy,
            take: input.take ?? 10,
            skip: input.after ? 1 : undefined, // First result on cursored requests is the cursor, so skip it
            cursor: input.after ? {
                id: input.after
            } : undefined,
            ...selectHelper(partialInfo)
        });
        // If there are no results
        if (searchResults.length === 0) return {
            totalThreads: 0,
            threads: [],
        }
        // Query total in thread, if cursor is not provided (since this means this data was already given to the user earlier)
        const totalInThread = input.after ? undefined : await prisma.comment.count({
            where: { ...where }
        });
        // Calculate end cursor
        const endCursor = searchResults[searchResults.length - 1].id;
        // If not as nestLimit, recurse with all result IDs
        const childThreads = nestLimit > 0 ? await this.searchThreads(userId, {
            ids: searchResults.map(r => r.id),
            take: input.take ?? 10,
            sortBy: input.sortBy ?? commentSearcher().defaultSort,
        }, info, nestLimit) : [];
        // Return result
        return {
            totalThreads: totalInThread,
            threads: childThreads,
            endCursor,
        }
    }
})

const forMapper = {
    [CommentFor.Project]: 'projectId',
    [CommentFor.Routine]: 'routineId',
    [CommentFor.Standard]: 'standardId',
}

/**
 * Handles authorized creates, updates, and deletes
 */
export const commentMutater = (prisma: PrismaType) => ({
    /**
     * Validate adds, updates, and deletes
     */
    async validateMutations({
        userId, createMany, updateMany, deleteMany
    }: ValidateMutationsInput<CommentCreateInput, CommentUpdateInput>): Promise<void> {
        if (!createMany && !updateMany && !deleteMany) return;
        if (!userId)
            throw new CustomError(CODE.Unauthorized, 'User must be logged in to perform CRUD operations', { code: genErrorCode('0038') });
        if (createMany) {
            commentsCreate.validateSync(createMany, { abortEarly: false });
            TranslationModel().profanityCheck(createMany)
            // TODO check limits on comments to prevent spam
        }
        if (updateMany) {
            commentsUpdate.validateSync(updateMany.map(u => u.data), { abortEarly: false });
            TranslationModel().profanityCheck(updateMany.map(u => u.data))
        }
        if (deleteMany) {
            // Check that user created each comment
            const comments = await prisma.comment.findMany({
                where: { id: { in: deleteMany } },
                select: {
                    id: true,
                    userId: true,
                    organizationId: true,
                }
            })
            // Filter out comments that user created
            const notCreatedByThisUser = comments.filter(c => c.userId !== userId);
            // If any comments not created by this user have a null organizationId, throw error
            if (notCreatedByThisUser.some(c => c.organizationId === null))
                throw new CustomError(CODE.Unauthorized, 'Some comments were not created by this user', { code: genErrorCode('0039') });
            // Of the remaining comments, check that user is an admin of the organization
            const organizationIds = notCreatedByThisUser.map(c => c.organizationId).filter(id => id !== null) as string[];
            const roles = userId
                ? await organizationVerifier(prisma).getRoles(userId, organizationIds)
                : Array(deleteMany.length).fill(null);
            if (roles.some((role: any) => role !== MemberRole.Owner && role !== MemberRole.Admin))
                throw new CustomError(CODE.Unauthorized, 'User must be an admin of the organization to delete comments', { code: genErrorCode('0040') });
        }
    },
    /**
     * Performs adds, updates, and deletes of organizations. First validates that every action is allowed.
     */
    async cud({ partialInfo, userId, createMany, updateMany, deleteMany }: CUDInput<CommentCreateInput, CommentUpdateInput>): Promise<CUDResult<Comment>> {
        await this.validateMutations({ userId, createMany, updateMany, deleteMany });
        // Perform mutations
        let created: any[] = [], updated: any[] = [], deleted: Count = { count: 0 };
        if (createMany) {
            // Loop through each create input
            for (const input of createMany) {
                // Create object
                const currCreated = await prisma.comment.create({
                    data: {
                        translations: TranslationModel().relationshipBuilder(userId, input, { create: commentTranslationCreate, update: commentTranslationUpdate }, false),
                        userId,
                        [forMapper[input.createdFor]]: input.forId,
                    },
                    ...selectHelper(partialInfo)
                })
                // Convert to GraphQL
                const converted = modelToGraphQL(currCreated, partialInfo);
                // Add to created array
                created = created ? [...created, converted] : [converted];
            }
        }
        if (updateMany) {
            // Loop through each update input
            for (const input of updateMany) {
                // Find comment
                let comment = await prisma.comment.findUnique({ where: input.where });
                if (!comment)
                    throw new CustomError(CODE.NotFound, "Comment not found", { code: genErrorCode('0041') });
                // Update comment
                const currUpdated = await prisma.comment.update({
                    where: input.where,
                    data: {
                        translations: TranslationModel().relationshipBuilder(userId, input.data, { create: commentTranslationCreate, update: commentTranslationUpdate }, false),
                    },
                    ...selectHelper(partialInfo)
                });
                // Convert to GraphQL
                const converted = modelToGraphQL(currUpdated, partialInfo);
                // Add to updated array
                updated = updated ? [...updated, converted] : [converted];
            }
        }
        if (deleteMany) {
            deleted = await prisma.comment.deleteMany({
                where: { id: { in: deleteMany } }
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

export function CommentModel(prisma: PrismaType) {
    const prismaObject = prisma.comment;
    const format = commentFormatter();
    const search = commentSearcher();
    const mutater = commentMutater(prisma);
    const query = commentQuerier(prisma);

    return {
        prisma,
        prismaObject,
        ...format,
        ...search,
        ...mutater,
        ...query
    }
}

//==============================================================
/* #endregion Model */
//==============================================================