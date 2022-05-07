import { CODE, reportCreate, ReportFor, reportUpdate } from "@local/shared";
import { CustomError } from "../../error";
import { Count, Report, ReportCreateInput, ReportSearchInput, ReportSortBy, ReportUpdateInput } from "../../schema/types";
import { PrismaType, RecursivePartial } from "types";
import { hasProfanity } from "../../utils/censor";
import { CUDInput, CUDResult, FormatConverter, GraphQLModelType, modelToGraphQL, PartialInfo, Searcher, selectHelper, ValidateMutationsInput } from "./base";
import { genErrorCode } from "../../logger";

//==============================================================
/* #region Custom Components */
//==============================================================

export const reportFormatter = (): FormatConverter<Report> => ({
    relationshipMap: { '__typename': GraphQLModelType.Report },
    removeCalculatedFields: (partial) => {
        let { isOwn, ...rest } = partial;
        // Add userId field so we can calculate isOwn
        return { ...rest, userId: true }
    },
    removeJoinTables: (data) => {
        // Remove userId to hide who submitted the report
        let { userId, ...rest } = data;
        return rest;
    },
    async addSupplementalFields(
        prisma: PrismaType,
        userId: string | null, // Of the user making the request
        objects: RecursivePartial<any>[],
        partial: PartialInfo,
    ): Promise<RecursivePartial<Report>[]> {
        // Query for isOwn
        if (partial.isOwn) objects = objects.map((x) => ({ ...x, isOwn: Boolean(userId) && x.fromId === userId }));
        // Convert Prisma objects to GraphQL objects
        return objects as RecursivePartial<Report>[];
    },
})

export const reportSearcher = (): Searcher<ReportSearchInput> => ({
    defaultSort: ReportSortBy.DateCreatedDesc,
    getSortQuery: (sortBy: string): any => {
        return {
            [ReportSortBy.DateCreatedAsc]: { created_at: 'asc' },
            [ReportSortBy.DateCreatedDesc]: { created_at: 'desc' },
            [ReportSortBy.DateUpdatedAsc]: { updated_at: 'asc' },
            [ReportSortBy.DateUpdatedDesc]: { updated_at: 'desc' },
        }[sortBy]
    },
    getSearchStringQuery: (searchString: string): any => {
        const insensitive = ({ contains: searchString.trim(), mode: 'insensitive' });
        return ({
            OR: [
                { reason: { ...insensitive } },
                { details: { ...insensitive } },
            ]
        })
    },
    customQueries(input: ReportSearchInput): { [x: string]: any } {
        return {
            ...(input.languages ? { translations: { some: { language: { in: input.languages } } } } : {}),
            ...(input.userId ? { userId: input.userId } : {}),
            ...(input.organizationId ? { organizationId: input.organizationId } : {}),
            ...(input.projectId ? { projectId: input.projectId } : {}),
            ...(input.routineId ? { routineId: input.routineId } : {}),
            ...(input.standardId ? { standardId: input.standardId } : {}),
            ...(input.tagId ? { tagId: input.tagId } : {}),
        }
    },
})

export const reportVerifier = () => ({
    // TODO not sure if report should have profanity check, since someone might 
    // just be trying to submit a report for a profane word
    profanityCheck(data: ReportCreateInput | ReportUpdateInput): void {
        if (hasProfanity(data.reason, data.details)) 
            throw new CustomError(CODE.BannedWord, 'Profanity is not allowed in the report reason or details.', { code: genErrorCode('0082') });
    },
})

const forMapper = {
    [ReportFor.Comment]: 'commentId',
    [ReportFor.Organization]: 'organizationId',
    [ReportFor.Project]: 'projectId',
    [ReportFor.Routine]: 'routineId',
    [ReportFor.Standard]: 'standardId',
    [ReportFor.Tag]: 'tagId',
    [ReportFor.User]: 'userId',
}

export const reportMutater = (prisma: PrismaType, verifier: any) => ({
    async toDBShapeAdd(userId: string | null, data: ReportCreateInput): Promise<any> {
        return {
            reason: data.reason,
            details: data.details,
            fromId: userId,
            [forMapper[data.createdFor]]: data.createdForId,
        }
    },
    async toDBShapeUpdate(userId: string | null, data: ReportUpdateInput): Promise<any> {
        return {
            reason: data.reason ?? undefined,
            details: data.details,
        }
    },
    async validateMutations({
        userId, createMany, updateMany, deleteMany
    }: ValidateMutationsInput<ReportCreateInput, ReportUpdateInput>): Promise<void> {
        if (!createMany && !updateMany && !deleteMany) return;
        if (!userId) 
            throw new CustomError(CODE.Unauthorized, 'User must be logged in to perform CRUD operations', { code: genErrorCode('0083') });
        if (createMany) {
            createMany.forEach(input => reportCreate.validateSync(input, { abortEarly: false }));
            createMany.forEach(input => verifier.profanityCheck(input));
            // Check if report already exists by user on object
            for (const input of createMany) {
                const existingReport = await prisma.report.count({
                    where: {
                        fromId: userId as string,
                        [forMapper[input.createdFor]]: input.createdForId,
                    }
                })
                if (existingReport > 0) {
                    throw new CustomError(CODE.ReportExists, 'You have already submitted a report for this object.', { code: genErrorCode('0084') });
                }
            }
        }
        if (updateMany) {
            updateMany.forEach(input => reportUpdate.validateSync(input.data, { abortEarly: false }));
            updateMany.forEach(input => verifier.profanityCheck(input.data));
        }
    },
    async cud({ partial, userId, createMany, updateMany, deleteMany }: CUDInput<ReportCreateInput, ReportUpdateInput>): Promise<CUDResult<Report>> {
        await this.validateMutations({ userId, createMany, updateMany, deleteMany });
        // Perform mutations
        let created: any[] = [], updated: any[] = [], deleted: Count = { count: 0 };
        if (createMany) {
            // Loop through each create input
            for (const input of createMany) {
                // Call createData helper function
                const data = await this.toDBShapeAdd(userId, input);
                // Create object
                const currCreated = await prisma.report.create({ data, ...selectHelper(partial) });
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
                if (!object) throw new CustomError(CODE.ErrorUnknown, 'Report not found.', { code: genErrorCode('0085') });
                // Update object
                const currUpdated = await prisma.report.update({
                    where: input.where,
                    data: await this.toDBShapeUpdate(userId, input.data),
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

export function ReportModel(prisma: PrismaType) {
    const prismaObject = prisma.report;
    const format = reportFormatter();
    const search = reportSearcher();
    const verify = reportVerifier();
    const mutate = reportMutater(prisma, verify);

    return {
        prisma,
        prismaObject,
        ...format,
        ...search,
        ...verify,
        ...mutate,
    }
}

//==============================================================
/* #endregion Model */
//==============================================================