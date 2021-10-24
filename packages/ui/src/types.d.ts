// Define common props
import { customers_customers } from 'graphql/generated/customers';

// Top-level props that can be passed into any routed component
export type Business = any;
export type UserRoles = { title: string; description: string | null; }[] | null;
export type SessionChecked = boolean;
export type OnSessionUpdate = any;
export interface CommonProps {
    business: Business;
    userRoles: UserRoles;
    sessionChecked: SessionChecked;
    onSessionUpdate: OnSessionUpdate;
}

// Rename auto-generated query objects
export type Customer = customers_customers;