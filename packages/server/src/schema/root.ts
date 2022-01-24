import { gql } from 'apollo-server-express';
import { GraphQLResolveInfo, GraphQLScalarType } from "graphql";
import { GraphQLUpload } from 'graphql-upload';
import { readFiles, saveFiles } from '../utils';
import ogs from 'open-graph-scraper';
import { AutocompleteInput, AutocompleteResult, OpenGraphResponse } from './types';
import { CODE, OrganizationSortBy, ProjectSortBy, RoutineSortBy, StandardSortBy, UserSortBy } from '@local/shared';
import { IWrap } from '../types';
import { Context } from '../context';
import { OrganizationModel, ProjectModel, RoutineModel, StandardModel, UserModel } from '../models';
import { CustomError } from '../error';

// Defines common inputs, outputs, and types for all GraphQL queries and mutations.
export const typeDef = gql`
    scalar Date
    scalar Upload

    # Used for Projects, Standards, and Routines, since they can be created 
    # by either a User or an Organization.
    union Contributor = User | Organization

    # Used for filtering by date created/updated, as well as fetching metrics (e.g. monthly active users)
    input TimeFrame {
        after: Date
        before: Date
    }

    # Return type for a cursor-based pagination's pageInfo response
    type PageInfo {
        hasNextPage: Boolean!
        endCursor: String
    }
    # Return type for delete mutations,
    # which return the number of affected rows
    type Count {
        count: Int
    }
    # Return type for mutations with a success boolean
    # Could return just the boolean, but this makes it clear what the result means
    type Success {
        success: Boolean
    }
    # Return type for error messages
    type Response {
        code: Int
        message: String!
    }

    # Return type for Open Graph queries
    type OpenGraphResponse {
        site: String
        title: String
        description: String
        imageUrl: String
    }

    input ReadAssetsInput {
        files: [String!]!
    }

    input ReadOpenGraphInput {
        url: String!
    }

    input WriteAssetsInput {
        files: [Upload!]!
    }

    # Input for finding object by id
    input FindByIdInput {
        id: ID!
    }

    # Input for deleting one object
    input DeleteOneInput {
        id: ID!
    }

    # Input for deleting multiple objects
    input DeleteManyInput {
        ids: [ID!]!
    }

    # Input for site-wide autocomplete search
    input AutocompleteInput {
        searchString: String!
        take: Int
    }

    type AutocompleteResult {
        organizations: [Organization!]!
        projects: [Project!]!
        routines: [Routine!]!
        standards: [Standard!]!
        users: [User!]!
    }

    type StatisticsResult {
        daily: StatisticsTimeFrame!
        weekly: StatisticsTimeFrame!
        monthly: StatisticsTimeFrame!
        yearly: StatisticsTimeFrame!
        allTime: StatisticsTimeFrame!
    }

    type StatisticsTimeFrame {
        organizations: [Int!]!
        projects: [Int!]!
        routines: [Int!]!
        standards: [Int!]!
        users: [Int!]!
    }

    # Base query. Must contain something,
    # which can be as simple as '_empty: String'
    type Query {
        # _empty: String
        readAssets(input: ReadAssetsInput!): [String]!
        readOpenGraph(input: ReadOpenGraphInput!): OpenGraphResponse!
        autocomplete(input: AutocompleteInput!): AutocompleteResult!
        statistics: StatisticsResult!
    }
    # Base mutation. Must contain something,
    # which can be as simple as '_empty: String'
    type Mutation {
        # _empty: String
        writeAssets(input: WriteAssetsInput!): Boolean
    }
`

export const resolvers = {
    Upload: GraphQLUpload,
    Date: new GraphQLScalarType({
        name: "Date",
        description: "Custom description for the date scalar",
        // Assumes data is either Unix timestamp or Date object
        parseValue(value) {
            return new Date(value).toISOString(); // value from the client
        },
        serialize(value) {
            return new Date(value).getTime(); // value sent to the client
        },
        parseLiteral(ast: any) {
            return new Date(ast).toDateString(); // ast value is always in string format
        }
    }),
    Query: {
        readAssets: async (_parent: undefined, { input }: any): Promise<Array<String | null>> => {
            return await readFiles(input.files);
        },
        readOpenGraph: async (_parent: undefined, { input }: any): Promise<OpenGraphResponse> => {
            return await ogs({ url: input.url })
                .then((data: any) => {
                    const { result } = data;
                    return {
                        site: result?.ogSiteName,
                        title: result?.ogTitle,
                        description: result?.ogDescription,
                        imageUrl: result?.ogImage?.url,
                    };
                }).catch(err => {
                    console.error('Caught error fetching Open Graph url', err);
                    return {};
                }).finally(() => { return {} })
        },
        /**
         * Autocomplete endpoint for main page. Combines search queries for all main objects
         */
        autocomplete: async (_parent: undefined, { input }: IWrap<AutocompleteInput>, { prisma, req }: Context, info: GraphQLResolveInfo): Promise<AutocompleteResult> => {
            console.log('Autocomplete input', input);
            const MinimumStars = 0; // Minimum stars required to show up in autocomplete results. Will increase in the future.
            const starsQuery = { stars: { gte: MinimumStars } }
            // Query organizations
            const organizations = (await OrganizationModel(prisma).searchOrganizations(
                { ...starsQuery },
                req.userId,
                {
                    ...input,
                    sortBy: OrganizationSortBy.StarsDesc
                },
                {
                    id: true,
                    name: true,
                    stars: true,
                })).edges.map(({ node }: any) => node);
            // Query projects
            const projects = (await ProjectModel(prisma).searchProjects(
                { ...starsQuery },
                req.userId,
                { ...input, sortBy: ProjectSortBy.StarsDesc },
                {
                    id: true,
                    name: true,
                    stars: true,
                    score: true,
                }
            )).edges.map(({ node }: any) => node);
            // Query routines
            const routines = (await RoutineModel(prisma).searchRoutines(
                { ...starsQuery },
                req.userId,
                { ...input, sortBy: RoutineSortBy.StarsDesc },
                {
                    id: true,
                    title: true,
                    stars: true,
                    score: true,
                }
            )).edges.map(({ node }: any) => node);
            // Query standards
            const standards = (await StandardModel(prisma).searchStandards(
                { ...starsQuery },
                req.userId,
                { ...input, sortBy: StandardSortBy.StarsDesc },
                {
                    id: true,
                    name: true,
                    stars: true,
                    score: true,
                }
            )).edges.map(({ node }: any) => node);
            // Query users
            const users = (await UserModel(prisma).searchUsers(
                { ...starsQuery },
                req.userId,
                {
                    ...input,
                    sortBy: UserSortBy.StarsDesc
                },
                {
                    id: true,
                    username: true,
                    stars: true,
                }
            )).edges.map(({ node }: any) => node);
            return {
                organizations,
                projects,
                routines,
                standards,
                users
            }
        },
        /**
         * Returns site-wide statistics
         */
        statistics: async (_parent: undefined, { input }: IWrap<AutocompleteInput>): Promise<any> => {
            // Query current stats
            // Read historical stats from file
            return new CustomError(CODE.NotImplemented);
        },
    },
    Mutation: {
        writeAssets: async (_parent: undefined, { input }: any): Promise<boolean> => {
            const data = await saveFiles(input.files);
            // Any failed writes will return null
            return !data.some(d => d === null)
        },
    }
}