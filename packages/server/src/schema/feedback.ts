import { feedbackSchema } from '@local/shared';
import { gql } from 'apollo-server-express';
import { IWrap } from 'types';
import { validateArgs } from '../error';
import { feedbackNotifyAdmin } from '../worker/email/queue';
import { FeedbackInput } from './types';

export const typeDef = gql`
    input FeedbackInput {
        text: String!
        userId: ID
    }

    extend type Mutation {
        addFeedback(input: FeedbackInput!): Boolean!
    }
`

export const resolvers = {
    Mutation: {
        addFeedback: async (_parent: undefined, { input }: IWrap<FeedbackInput>, context: any, _info: any): Promise<Boolean> => {
            // Validate arguments with schema
            const validateError = await validateArgs(feedbackSchema, input);
            if (validateError) throw validateError;
            // Find user who sent feedback, if any
            let from = input.userId ? await context.prisma.user({ id: input.userId }) : null;
            // Send feedback to admin
            feedbackNotifyAdmin(input.text, from?.username);
            return true;
        },
    }
}