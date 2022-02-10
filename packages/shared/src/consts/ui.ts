import { ValueOf } from '.';

export const APP_LINKS = {
    Develop: '/develop', // Develop dashboard
    ForgotPassword: '/forgot-password', // Page for sending password reset request emails
    Home: '/', // Main dashboard for logged in users
    Learn: '/learn', // Learn dashboard
    Orchestrate: '/orchestrate', // View or update routine orchestration
    Organization: '/organization', // View or update specific organization
    Profile: '/profile', // View or update profile and settings (or view another actor's profile)
    Project: '/project', // View or update specific project
    Research: '/research', // Research dashboard
    Routine: '/routine', // View or update specific routine
    Run: '/run', // Displays a UI corresponding to the current subroutine
    ResetPassword: '/password-reset', // Page to reset password, after clicking on password reset link in email
    SearchOrganizations: '/search/organization', // Search organizations
    SearchProjects: '/search/project', // Search projects
    SearchRoutines: '/search/routine', // Search routines
    SearchStandards: '/search/standard', // Search standards
    SearchUsers: '/search/user', // Search users
    Settings: '/settings', // View or update settings
    Standard: '/standard', // View or update specific standard
    Start: '/start', // Provides options for entering application
    Stats: '/stats', // Provides statistics for the website (no admin, so only place to see users, metrics, etc.)
}
export type APP_LINKS = ValueOf<typeof APP_LINKS>;

export const LANDING_LINKS = {
    About: '/about', // Overview of project, the vision, and the team
    Benefits: '/#understand-your-workflow', // Start of slides overviewing benefits of using Vrooli
    Home: '/', // Default page when not logged in. Similar to the about page, but more project details and less vision
    Mission: '/mission', // More details about the project's overall vision
    PrivacyPolicy: '/privacy-policy', // Privacy policy
    Roadmap: '/mission#roadmap', // Start of roadmap slide
    Terms: '/terms-and-conditions', // Terms and conditions
}
export type LANDING_LINKS = ValueOf<typeof LANDING_LINKS>;

export const THEME = {
    Light: 'light',
    Dark: 'dark'
}
export type THEME = ValueOf<typeof THEME>;