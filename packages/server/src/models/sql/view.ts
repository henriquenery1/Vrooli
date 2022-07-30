import { CODE, isObject, ViewFor } from "@local/shared";
import { CustomError } from "../../error";
import { Count, LogType, User, ViewSearchInput, ViewSortBy } from "../../schema/types";
import { PrismaType, RecursivePartial } from "../../types";
import { deconstructUnion, FormatConverter, GraphQLModelType, PartialGraphQLInfo, readManyHelper, Searcher, timeFrameToPrisma } from "./base";
import { genErrorCode, logger, LogLevel } from "../../logger";
import { Log } from "../../models/nosql";
import { OrganizationModel } from "./organization";
import { initializeRedis } from "../../redisConn";
import { ProjectModel } from "./project";
import { RoutineModel } from "./routine";
import { StandardModel } from "./standard";
import { UserModel } from "./user";
import { resolveProjectOrOrganizationOrRoutineOrStandardOrUser } from "../../schema/resolvers";

//==============================================================
/* #region Custom Components */
//==============================================================

export interface View {
    __typename?: 'View';
    from: User;
    to: ViewFor;
}

export const viewFormatter = (): FormatConverter<View> => ({
    relationshipMap: {
        '__typename': GraphQLModelType.View,
        'from': GraphQLModelType.User,
        'to': {
            'Organization': GraphQLModelType.Organization,
            'Project': GraphQLModelType.Project,
            'Routine': GraphQLModelType.Routine,
            'Standard': GraphQLModelType.Standard,
            'User': GraphQLModelType.User,
        }
    },
    constructUnions: (data) => {
        let { organization, project, routine, standard, user, ...modified } = data;
        if (organization) modified.to = organization;
        else if (project) modified.to = project;
        else if (routine) modified.to = routine;
        else if (standard) modified.to = standard;
        else if (user) modified.to = user;
        return modified;
    },
    deconstructUnions: (partial) => {
        let modified = deconstructUnion(partial, 'to', [
            [GraphQLModelType.Organization, 'organization'],
            [GraphQLModelType.Project, 'project'],
            [GraphQLModelType.Routine, 'routine'],
            [GraphQLModelType.Standard, 'standard'],
            [GraphQLModelType.User, 'user'],
        ]);
        return modified;
    },
    async addSupplementalFields(
        prisma: PrismaType,
        userId: string | null, // Of the user making the request
        objects: RecursivePartial<any>[],
        partial: PartialGraphQLInfo,
    ): Promise<RecursivePartial<View>[]> {
        // Query for data that view is applied to
        if (isObject(partial.to)) {
            const toTypes: GraphQLModelType[] = objects.map(o => resolveProjectOrOrganizationOrRoutineOrStandardOrUser(o.to))
            const toIds = objects.map(x => x.to?.id ?? '') as string[];
            // Group ids by types
            const toIdsByType: { [x: string]: string[] } = {};
            toTypes.forEach((type, i) => {
                if (!toIdsByType[type]) toIdsByType[type] = [];
                toIdsByType[type].push(toIds[i]);
            })
            // Query for each type
            const tos: any[] = [];
            for (const type of Object.keys(toIdsByType)) {
                let typeModel: any; 
                switch (type) {
                    case GraphQLModelType.Organization:
                        typeModel = OrganizationModel(prisma);
                        break;
                    case GraphQLModelType.Project:
                        typeModel = ProjectModel(prisma);
                        break;
                    case GraphQLModelType.Routine:
                        typeModel = RoutineModel(prisma);
                        break;
                    case GraphQLModelType.Standard:
                        typeModel = StandardModel(prisma);
                        break;
                    case GraphQLModelType.User:
                        typeModel = UserModel(prisma);
                        break;
                    default:
                        throw new CustomError(CODE.InternalError, `View applied to unsupported type: ${type}`, { code: genErrorCode('0186') });
                }
                const paginated = await readManyHelper(userId, { ids: toIdsByType[type] }, partial.to[type], typeModel);
                tos.push(...paginated.edges.map(x => x.node));
            }
            // Apply each "to" to the "to" property of each object
            for (const object of objects) {
                // Find the correct "to", using object.to.id
                const to = tos.find(x => x.id === object.to.id);
                object.to = to;
            }
        }
        return objects;
    },
})

const forMapper = {
    [ViewFor.Organization]: 'organization',
    [ViewFor.Project]: 'project',
    [ViewFor.Routine]: 'routine',
    [ViewFor.Standard]: 'standard',
    [ViewFor.User]: 'user',
}

export interface ViewInput {
    forId: string;
    title: string;
    viewFor: ViewFor;
}

export const viewSearcher = (): Searcher<ViewSearchInput> => ({
    defaultSort: ViewSortBy.LastViewedDesc,
    getSortQuery: (sortBy: string): any => {
        return {
            [ViewSortBy.LastViewedAsc]: { lastViewed: 'asc' },
            [ViewSortBy.LastViewedDesc]: { lastViewed: 'desc' },
        }[sortBy]
    },
    getSearchStringQuery: (searchString: string, languages?: string[]): any => {
        const insensitive = ({ contains: searchString.trim(), mode: 'insensitive' });
        return ({
            title: { ...insensitive }
        })
    },
    customQueries(input: ViewSearchInput): { [x: string]: any } {
        return {
            ...(input.lastViewedTimeFrame !== undefined ? timeFrameToPrisma('lastViewed', input.lastViewedTimeFrame) : {}),
        }
    },
})

/**
 * Marks objects as viewed. If view exists, updates last viewed time.
 * A user may view their own objects, but it does not count towards its view count.
 * @returns True if view updated correctly
 */
const viewer = (prisma: PrismaType) => ({
    async view(userId: string, input: ViewInput): Promise<boolean> {
        // Define prisma type for viewed object
        const prismaFor = (prisma[forMapper[input.viewFor] as keyof PrismaType] as any);
        // Check if object being viewed on exists
        const viewFor: null | { id: string, views: number } = await prismaFor.findUnique({ where: { id: input.forId }, select: { id: true, views: true } });
        if (!viewFor)
            throw new CustomError(CODE.ErrorUnknown, 'Could not find object being viewed', { code: genErrorCode('0173') });
        // Check if view exists
        let view = await prisma.view.findFirst({
            where: {
                byId: userId,
                [`${forMapper[input.viewFor]}Id`]: input.forId
            }
        })
        // If view already existed, update view time
        if (view) {
            await prisma.view.update({
                where: { id: view.id },
                data: {
                    lastViewed: new Date(),
                    title: input.title,
                }
            })
        }
        // If view did not exist, create it
        else {
            view = await prisma.view.create({
                data: {
                    byId: userId,
                    [`${forMapper[input.viewFor]}Id`]: input.forId,
                    title: input.title,
                }
            })
        }
        // Check if a view from this user should increment the view count
        let isOwn = false;
        switch (input.viewFor) {
            case ViewFor.Organization:
                // Check if user is an admin or owner of the organization
                const memberData = await OrganizationModel(prisma).isOwnerOrAdmin(userId, [input.forId]);
                isOwn = Boolean(memberData[0]);
                break;
            case ViewFor.Project:
                // Check if project is owned by this user or by an organization they are a member of
                //TODO
                // const project = await prisma.project.findFirst({
                //     where: {
                //         AND: [
                //             { id: input.forId },
                //             {
                //                 OR: [
                //                     { user: { id: userId } },
                //                     {
                //                         organization: {
                //                             members: {
                //                                 some: {
                //                                     id: userId,
                //                                     role: { in: [MemberRole.Admin as any, MemberRole.Owner as any] },
                //                                 }
                //                             }
                //                         }
                //                     }
                //                 ]
                //             }
                //         ]
                //     }
                // })
                // if (project) isOwn = true;
                break;
            case ViewFor.Routine:
                // Check if routine is owned by this user or by an organization they are a member of
                //TODO
                // const routine = await prisma.routine.findFirst({
                //     where: {
                //         AND: [
                //             { id: input.forId },
                //             {
                //                 OR: [
                //                     { user: { id: userId } },
                //                     {
                //                         organization: {
                //                             members: {
                //                                 some: {
                //                                     id: userId,
                //                                     role: { in: [MemberRole.Admin as any, MemberRole.Owner as any] },
                //                                 }
                //                             }
                //                         }
                //                     }
                //                 ]
                //             }
                //         ]
                //     }
                // })
                // if (routine) isOwn = true;
                break;
            case ViewFor.Standard:
                // Check if standard is owned by this user or by an organization they are a member of
                //TODO
                // const standard = await prisma.standard.findFirst({
                //     where: {
                //         AND: [
                //             { id: input.forId },
                //             {
                //                 OR: [
                //                     { createdByUser: { id: userId } },
                //                     {
                //                         createdByOrganization: {
                //                             members: {
                //                                 some: {
                //                                     id: userId,
                //                                     role: { in: [MemberRole.Admin as any, MemberRole.Owner as any] },
                //                                 }
                //                             }
                //                         }
                //                     }
                //                 ]
                //             }
                //         ]
                //     }
                // })
                // if (standard) isOwn = true;
                break;
            case ViewFor.User:
                isOwn = userId === input.forId;
                break;
        }
        // If user is owner, don't do anything else
        if (isOwn) return true;
        // Check the last time the user viewed this object
        const redisKey = `view:${userId}_${input.forId}_${input.viewFor}`
        const client = await initializeRedis();
        const lastViewed = await client.get(redisKey);
        // If object viewed more than 1 hour ago, update view count
        if (!lastViewed || new Date(lastViewed).getTime() < new Date().getTime() - 3600000) {
            await prismaFor.update({
                where: { id: input.forId },
                data: { views: viewFor.views + 1 }
            })
            // Log view
            Log.collection.insertOne({
                timestamp: Date.now(),
                userId: userId,
                action: LogType.View,
                object1Type: input.viewFor,
                object1Id: input.forId,
            }).catch(error => logger.log(LogLevel.error, 'Failed creating "View" log', { code: genErrorCode('0203'), error }));
        }
        // Update last viewed time
        await client.set(redisKey, new Date().toISOString());
        return true;
    },
    /**
     * Deletes views from user's view list, but does not affect view count or logs.
     */
    async deleteViews(userId: string, ids: string[]): Promise<Count> {
        return await prisma.view.deleteMany({
            where: {
                AND: [
                    { id: { in: ids } },
                    { byId: userId },
                ]
            }
        })
    },
    /**
     * Removes all of user's views, but does not affect view count or logs.
     */
    async clearViews(userId: string): Promise<Count> {
        return await prisma.view.deleteMany({
            where: { byId: userId }
        })
    },
    async getIsVieweds(
        userId: string,
        ids: string[],
        viewFor: keyof typeof ViewFor
    ): Promise<Array<boolean | null>> {
        // Create result array that is the same length as ids
        const result = new Array(ids.length).fill(null);
        // Filter out nulls and undefineds from ids
        const idsFiltered = ids.filter(id => id !== null && id !== undefined);
        const fieldName = `${viewFor.toLowerCase()}Id`;
        const isViewedArray = await prisma.view.findMany({ where: { byId: userId, [fieldName]: { in: idsFiltered } } });
        // Replace the nulls in the result array with true if viewed
        for (let i = 0; i < ids.length; i++) {
            // Try to find this id in the isViewed array
            result[i] = Boolean(isViewedArray.find((view: any) => view[fieldName] === ids[i]));
        }
        return result;
    },
})

//==============================================================
/* #endregion Custom Components */
//==============================================================

//==============================================================
/* #region Model */
//==============================================================

export function ViewModel(prisma: PrismaType) {
    const prismaObject = prisma.view;
    const format = viewFormatter();
    const search = viewSearcher();

    return {
        prisma,
        prismaObject,
        ...format,
        ...search,
        ...viewer(prisma),
    }
}

//==============================================================
/* #endregion Model */
//==============================================================