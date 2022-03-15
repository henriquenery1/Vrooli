import { gql } from 'apollo-server-express';
import { DeleteOneInput, FindByIdInput, Report, ReportCountInput, ReportCreateInput, ReportFor, ReportSearchInput, ReportSearchResult, ReportSortBy, ReportUpdateInput, Success } from './types';
import { IWrap, RecursivePartial } from 'types';
import { Context } from '../context';
import { GraphQLResolveInfo } from 'graphql';
import { countHelper, createHelper, deleteOneHelper, readManyHelper, readOneHelper, ReportModel, updateHelper } from '../models';

export const typeDef = gql`
    enum ReportFor {
        Comment
        Organization
        Project
        Routine
        Standard
        Tag
        User
    }   

    enum ReportSortBy {
        DateCreatedAsc
        DateCreatedDesc
        DateUpdatedAsc
        DateUpdatedDesc
    }

    input ReportCreateInput {
        createdFor: ReportFor!
        createdForId: ID!
        details: String
        language: String!
        reason: String!
    }
    input ReportUpdateInput {
        id: ID!
        details: String
        language: String
        reason: String
    }

    type Report {
        id: ID
        isOwn: Boolean!
        details: String
        language: String!
        reason: String!
    }

    input ReportSearchInput {
        userId: ID
        organizationId: ID
        projectId: ID
        routineId: ID
        standardId: ID
        tagId: ID
        ids: [ID!]
        languages: [String!]
        sortBy: ReportSortBy
        createdTimeFrame: TimeFrame
        updatedTimeFrame: TimeFrame
        searchString: String
        after: String
        take: Int
    }

    # Return type for search result
    type ReportSearchResult {
        pageInfo: PageInfo!
        edges: [ReportEdge!]!
    }

    # Return type for search result edge
    type ReportEdge {
        cursor: String!
        node: Report!
    }

    # Input for count
    input ReportCountInput {
        createdTimeFrame: TimeFrame
        updatedTimeFrame: TimeFrame
    }

    extend type Query {
        report(input: FindByIdInput!): Report
        reports(input: ReportSearchInput!): ReportSearchResult!
        reportsCount(input: ReportCountInput!): Int!
    }

    extend type Mutation {
        reportCreate(input: ReportCreateInput!): Report!
        reportUpdate(input: ReportUpdateInput!): Report!
        reportDeleteOne(input: DeleteOneInput!): Success!
    }
`

export const resolvers = {
    ReportFor: ReportFor,
    ReportSortBy: ReportSortBy,
    Query: {
        report: async (_parent: undefined, { input }: IWrap<FindByIdInput>, { prisma, req }: Context, info: GraphQLResolveInfo): Promise<RecursivePartial<Report> | null> => {
            return readOneHelper(req.userId, input, info, ReportModel(prisma));
        },
        reports: async (_parent: undefined, { input }: IWrap<ReportSearchInput>, { prisma, req }: Context, info: GraphQLResolveInfo): Promise<ReportSearchResult> => {
            return readManyHelper(req.userId, input, info, ReportModel(prisma));
        },
        reportsCount: async (_parent: undefined, { input }: IWrap<ReportCountInput>, { prisma }: Context, _info: GraphQLResolveInfo): Promise<number> => {
            return countHelper(input, ReportModel(prisma));
        },
    },
    Mutation: {
        reportCreate: async (_parent: undefined, { input }: IWrap<ReportCreateInput>, { prisma, req }: Context, info: GraphQLResolveInfo): Promise<RecursivePartial<Report>> => {
            return createHelper(req.userId, input, info, ReportModel(prisma));
        },
        reportUpdate: async (_parent: undefined, { input }: IWrap<ReportUpdateInput>, { prisma, req }: Context, info: GraphQLResolveInfo): Promise<RecursivePartial<Report>> => {
            return updateHelper(req.userId, input, info, ReportModel(prisma));
        },
        reportDeleteOne: async (_parent: undefined, { input }: IWrap<DeleteOneInput>, { prisma, req }: Context, _info: GraphQLResolveInfo): Promise<Success> => {
            return deleteOneHelper(req.userId, input, ReportModel(prisma));
        },
    }
}