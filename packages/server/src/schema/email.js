import { gql } from 'apollo-server-express';
import { CODE } from '@local/shared';
import { CustomError } from '../error';
import { PrismaSelect } from '@paljs/plugins';

export const typeDef = gql`
    input EmailInput {
        id: ID
        emailAddress: String!
        receivesDeliveryUpdates: Boolean
        customerId: ID
    }

    type Email {
        id: ID!
        emailAddress: String!
        receivesDeliveryUpdates: Boolean!
        verified: Boolean!
        customer: Customer
    }

    extend type Query {
        emails: [Email!]!
    }

    extend type Mutation {
        addEmail(input: EmailInput!): Email!
        updateEmail(input: EmailInput!): Email!
        deleteEmails(ids: [ID!]!): Count!
    }
`

export const resolvers = {
    Query: {
        emails: async (_parent, _args, context, info) => {
            // Must be admin
            if (!context.req.isAdmin) return new CustomError(CODE.Unauthorized);
            return await context.prisma.email.findMany((new PrismaSelect(info).value));
        }
    },
    Mutation: {
        addEmail: async (_parent, args, context, info) => {
            // Must be admin, or adding to your own
            if(!context.req.isAdmin || (context.req.customerId !== args.input.customerId)) return new CustomError(CODE.Unauthorized);
            return await context.prisma.email.create((new PrismaSelect(info).value), { data: { ...args.input } });
        },
        updateEmail: async (_parent, args, context, info) => {
            // Must be admin, or updating your own
            if(!context.req.isAdmin) return new CustomError(CODE.Unauthorized);
            const curr = await context.prisma.email.findUnique({ where: { id: args.input.id } });
            if (context.req.customerId !== curr.custmoerId) return new CustomError(CODE.Unauthorized);
            return await context.prisma.email.update({
                where: { id: args.input.id || undefined },
                data: { ...args.input },
                ...(new PrismaSelect(info).value)
            })
        },
        deleteEmails: async (_parent, args, context, _info) => {
            // Must be admin, or deleting your own
            // TODO must keep at least one email per customer
            const specified = await context.prisma.email.findMany({ where: { id: { in: args.ids } } });
            if (!specified) return new CustomError(CODE.ErrorUnknown);
            const customerIds = [...new Set(specified.map(s => s.customerId))];
            if (!context.req.isAdmin && (customerIds.length > 1 || context.req.customerId !== customerIds[0])) return new CustomError(CODE.Unauthorized);
            return await context.prisma.email.deleteMany({ where: { id: { in: args.ids } } });
        }
    }
}