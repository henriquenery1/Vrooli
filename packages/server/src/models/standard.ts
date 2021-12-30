import { PrismaType } from "types";
import { Routine, Standard, StandardCountInput, StandardInput, StandardSearchInput, StandardSortBy, Tag, User } from "../schema/types";
import { counter, creater, deleter, findByIder, FormatConverter, MODEL_TYPES, reporter, searcher, Sortable, updater } from "./base";

//======================================================================================================================
/* #region Type Definitions */
//======================================================================================================================

// Type 1. RelationshipList
export type StandardRelationshipList = 'tags' | 'routineInputs' | 'routineOutputs' | 'starredBy' |
    'reports' | 'comments';
// Type 2. QueryablePrimitives
export type StandardQueryablePrimitives = Omit<Standard, StandardRelationshipList>;
// Type 3. AllPrimitives
export type StandardAllPrimitives = StandardQueryablePrimitives;
// type 4. FullModel
export type StandardFullModel = StandardAllPrimitives &
Pick<Standard, 'reports' | 'comments'> &
{
    tags: { tag: Tag[] }[],
    routineInputs: { routine: Routine[] }[],
    routineOutputs: { routine: Routine[] }[],
    starredBy: { user: User[] }[],
};

//======================================================================================================================
/* #endregion Type Definitions */
//======================================================================================================================

//==============================================================
/* #region Custom Components */
//==============================================================

/**
 * Component for formatting between graphql and prisma types
 */
 const formatter = (): FormatConverter<any, any>  => ({
    toDB: (obj: any): any => ({ ...obj}),
    toGraphQL: (obj: any): any => ({ ...obj })
})

/**
 * Component for search filters
 */
 const sorter = (): Sortable<StandardSortBy> => ({
    defaultSort: StandardSortBy.AlphabeticalDesc,
    getSortQuery: (sortBy: string): any => {
        return {
            [StandardSortBy.AlphabeticalAsc]: { name: 'asc' },
            [StandardSortBy.AlphabeticalDesc]: { name: 'desc' },
            [StandardSortBy.CommentsAsc]: { comments: { count: 'asc' } },
            [StandardSortBy.CommentsDesc]: { comments: { count: 'desc' } },
            [StandardSortBy.DateCreatedAsc]: { created_at: 'asc' },
            [StandardSortBy.DateCreatedDesc]: { created_at: 'desc' },
            [StandardSortBy.DateUpdatedAsc]: { updated_at: 'asc' },
            [StandardSortBy.DateUpdatedDesc]: { updated_at: 'desc' },
            [StandardSortBy.StarsAsc]: { stars: { count: 'asc' } },
            [StandardSortBy.StarsDesc]: { stars: { count: 'desc' } },
            [StandardSortBy.VotesAsc]: { votes: { count: 'asc' } },
            [StandardSortBy.VotesDesc]: { votes: { count: 'desc' } },
        }[sortBy]
    },
    getSearchStringQuery: (searchString: string): any => {
        const insensitive = ({ contains: searchString.trim(), mode: 'insensitive' });
        return ({
            OR: [
                { name: { ...insensitive } },
                { description: { ...insensitive } },
                { tags: { tag: { name: { ...insensitive } } } },
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

export function StandardModel(prisma?: PrismaType) {
    const model = MODEL_TYPES.Standard;
    const format = formatter();
    const sort = sorter();

    return {
        prisma,
        model,
        ...format,
        ...sort,
        ...counter<StandardCountInput>(model, prisma),
        ...creater<StandardInput, StandardFullModel>(model, prisma),
        ...deleter(model, prisma),
        ...findByIder<StandardFullModel>(model, prisma),
        ...reporter(),
        ...searcher<StandardSortBy, StandardSearchInput, Standard, StandardFullModel>(model, format.toGraphQL, sort, prisma),
        ...updater<StandardInput, StandardFullModel>(model, prisma),
    }
}

//==============================================================
/* #endregion Model */
//==============================================================