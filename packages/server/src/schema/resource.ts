import { gql } from 'apollo-server-express';
import { ResourceFor, ResourceSortBy, ResourceUsedFor } from '@local/shared';
import { countHelper, createHelper, deleteManyHelper, readManyHelper, readOneHelper, ResourceModel, updateHelper } from '../models';
import { IWrap, RecursivePartial } from 'types';
import { Count, DeleteManyInput, FindByIdInput, Resource, ResourceCountInput, ResourceCreateInput, ResourceUpdateInput, ResourceSearchInput, ResourceSearchResult } from './types';
import { Context } from '../context';
import { GraphQLResolveInfo } from 'graphql';

export const typeDef = gql`
    enum ResourceFor {
        Organization
        Project
        Routine
        User
    }

    enum ResourceSortBy {
        DateCreatedAsc
        DateCreatedDesc
        DateUpdatedAsc
        DateUpdatedDesc
        IndexAsc
        IndexDesc
    }

    enum ResourceUsedFor {
        Community
        Context
        Developer
        Donation
        ExternalService
        Install
        Learning
        OfficialWebsite
        Proposal
        Related
        Social
        Tutorial
    }

    input ResourceCreateInput {
        createdFor: ResourceFor!
        createdForId: ID!
        index: Int
        link: String!
        translationsCreate: [ResourceTranslationCreateInput!]
        usedFor: ResourceUsedFor!
    }
    input ResourceUpdateInput {
        id: ID!
        createdFor: ResourceFor
        createdForId: ID
        index: Int
        link: String
        translationsDelete: [ID!]
        translationsCreate: [ResourceTranslationCreateInput!]
        translationsUpdate: [ResourceTranslationUpdateInput!]
        usedFor: ResourceUsedFor
    }
    type Resource {
        id: ID!
        created_at: Date!
        updated_at: Date!
        createdFor: ResourceFor!
        createdForId: ID!
        index: Int
        link: String!
        translations: [ResourceTranslation!]!
        usedFor: ResourceUsedFor
    }

    input ResourceTranslationCreateInput {
        language: String!
        description: String
        title: String
    }
    input ResourceTranslationUpdateInput {
        id: ID!
        language: String
        description: String
        title: String
    }
    type ResourceTranslation {
        id: ID!
        language: String!
        description: String
        title: String
    }

    input ResourceSearchInput {
        forId: ID
        forType: ResourceFor
        ids: [ID!]
        languages: [String!]
        sortBy: ResourceSortBy
        createdTimeFrame: TimeFrame
        updatedTimeFrame: TimeFrame
        searchString: String
        after: String
        take: Int
    }

    # Return type for search result
    type ResourceSearchResult {
        pageInfo: PageInfo!
        edges: [ResourceEdge!]!
    }

    # Return type for search result edge
    type ResourceEdge {
        cursor: String!
        node: Resource!
    }

    # Input for count
    input ResourceCountInput {
        createdTimeFrame: TimeFrame
        updatedTimeFrame: TimeFrame
    }

    extend type Query {
        resource(input: FindByIdInput!): Resource
        resources(input: ResourceSearchInput!): ResourceSearchResult!
        resourcesCount(input: ResourceCountInput!): Int!
    }

    extend type Mutation {
        resourceCreate(input: ResourceCreateInput!): Resource!
        resourceUpdate(input: ResourceUpdateInput!): Resource!
        resourceDeleteMany(input: DeleteManyInput!): Count!
    }
`

export const resolvers = {
    ResourceFor: ResourceFor,
    ResourceSortBy: ResourceSortBy,
    ResourceUsedFor: ResourceUsedFor,
    Query: {
        resource: async (_parent: undefined, { input }: IWrap<FindByIdInput>, { prisma, req }: Context, info: GraphQLResolveInfo): Promise<RecursivePartial<Resource> | null> => {
            return readOneHelper(req.userId, input, info, ResourceModel(prisma));
        },
        resources: async (_parent: undefined, { input }: IWrap<ResourceSearchInput>, { prisma, req }: Context, info: GraphQLResolveInfo): Promise<ResourceSearchResult> => {
            return readManyHelper(req.userId, input, info, ResourceModel(prisma));
        },
        resourcesCount: async (_parent: undefined, { input }: IWrap<ResourceCountInput>, { prisma }: Context, _info: GraphQLResolveInfo): Promise<number> => {
            return countHelper(input, ResourceModel(prisma));
        },
    },
    Mutation: {
        resourceCreate: async (_parent: undefined, { input }: IWrap<ResourceCreateInput>, { prisma, req }: Context, info: GraphQLResolveInfo): Promise<RecursivePartial<Resource>> => {
            return createHelper(req.userId, input, info, ResourceModel(prisma));
        },
        resourceUpdate: async (_parent: undefined, { input }: IWrap<ResourceUpdateInput>, { prisma, req }: Context, info: GraphQLResolveInfo): Promise<RecursivePartial<Resource>> => {
            return updateHelper(req.userId, input, info, ResourceModel(prisma));
        },
        resourceDeleteMany: async (_parent: undefined, { input }: IWrap<DeleteManyInput>, { prisma, req }: Context, _info: GraphQLResolveInfo): Promise<Count> => {
            return deleteManyHelper(req.userId, input, ResourceModel(prisma));
        },
    }
}