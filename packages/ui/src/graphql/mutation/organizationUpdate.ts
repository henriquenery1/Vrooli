import { gql } from 'graphql-tag';
import { organizationFields } from 'graphql/fragment';

export const organizationUpdateMutation = gql`
    ${organizationFields}
    mutation organizationUpdate($input: OrganizationInput!) {
        organizationUpdate(input: $input) {
            ...organizationFields
        }
    }
`