/* eslint-disable @typescript-eslint/no-redeclare */
import {
    Apps as ProjectsIcon,
    ExitToApp as LogOutIcon,
    Flag as MissionIcon,
    Home as HomeIcon,
    Info as AboutIcon,
    PersonAdd as RegisterIcon,
    PlayCircle as DevelopIcon,
    School as LearnIcon,
    Science as ResearchIcon,
} from '@material-ui/icons';
import { LINKS } from 'utils';
import { initializeApollo } from 'graphql/utils/initialize';
import { logoutMutation } from 'graphql/mutation';
import {
    Badge,
    BottomNavigationAction,
    Button,
    IconButton,
    ListItem,
    ListItemIcon,
    ListItemText,
} from '@material-ui/core';
import { UserRoles } from 'types';
import { ROLES, ValueOf } from '@local/shared';

export const ACTION_TAGS = {
    Landing: 'landing',
    Mission: 'mission',
    About: 'about',
    Start: 'start',
    Home: 'home',
    Projects: 'projects',
    Learn: 'learn',
    Research: 'research',
    Develop: 'develop',
    LogIn: 'login',
    LogOut: 'logout',
}
export type ACTION_TAGS = ValueOf<typeof ACTION_TAGS>;

export type ActionArray = [string, any, string, (() => any) | null, any, number];
export interface Action {
    label: string;
    value: ACTION_TAGS;
    link: string;
    onClick: (() => any) | null;
    Icon: any;
    numNotifications: number;
}

// Returns navigational actions available to the user
interface GetUserActionsProps {
    userRoles: UserRoles;
    exclude?: ACTION_TAGS[] | undefined;
}
export function getUserActions({ userRoles, exclude = [] }: GetUserActionsProps): Action[] {
    let actions: ActionArray[] = [];

    // If user has not entered main application
    if (!userRoles) {
        actions.push(
            ['Home', ACTION_TAGS.Landing, LINKS.Landing, null, HomeIcon, 0],
            ['Mission', ACTION_TAGS.Mission, LINKS.Mission, null, MissionIcon, 0],
            ['About Us', ACTION_TAGS.About, LINKS.About, null, AboutIcon, 0],
            ['Start', ACTION_TAGS.Start, LINKS.Start, null, DevelopIcon, 0],
        );
    } else {
        actions.push(
            ['Home', ACTION_TAGS.Home, LINKS.Home, null, HomeIcon, 0],
            ['Projects', ACTION_TAGS.Projects, LINKS.Projects, null, ProjectsIcon, 0],
            ['Learn', ACTION_TAGS.Learn, LINKS.Learn, null, LearnIcon, 0],
            ['Research', ACTION_TAGS.Research, LINKS.Research, null, ResearchIcon, 0],
            ['Develop', ACTION_TAGS.Develop, LINKS.Develop, null, DevelopIcon, 0],
        );
        // If user is entered main application, but not logged in
        if (!userRoles?.includes(ROLES.Customer)) {
            actions.push(['Log In', ACTION_TAGS.LogIn, LINKS.LogIn, null, RegisterIcon, 0]);
        } else {
            actions.push(['Log Out', ACTION_TAGS.LogOut, LINKS.Landing, () => { const client = initializeApollo(); client.mutate({ mutation: logoutMutation }) }, LogOutIcon, 0]);
        }
    }

    return actions.map(a => createAction(a)).filter(a => !exclude.includes(a.value));
}

// Factory for creating action objects
const createAction = (action: ActionArray): Action => {
    const keys = ['label', 'value', 'link', 'onClick', 'Icon', 'numNotifications'];
    return action.reduce((obj: {}, val: any, i: number) => { obj[keys[i]] = val; return obj }, {}) as Action;
}

// Factory for creating a list of action objects
export const createActions = (actions: ActionArray[]): Action[] => actions.map(a => createAction(a));

// Display actions as a list
interface ActionsToListProps {
    actions: Action[];
    history: any;
    classes?: { [key: string]: string };
    showIcon?: boolean;
    onAnyClick?: () => any;
}
export const actionsToList = ({ actions, history, classes = { listItem: '', listItemIcon: '' }, showIcon = true, onAnyClick = () => { } }: ActionsToListProps) => {
    return actions.map(({ label, value, link, onClick, Icon, numNotifications }) => (
        <ListItem
            key={value}
            classes={{ root: classes.listItem }}
            onClick={() => {
                history.push(link);
                if (onClick) onClick();
                if (onAnyClick) onAnyClick();
            }}>
            {showIcon && Icon ?
                (<ListItemIcon>
                    <Badge badgeContent={numNotifications} color="error">
                        <Icon className={classes.listItemIcon} />
                    </Badge>
                </ListItemIcon>) : ''}
            <ListItemText primary={label} />
        </ListItem>
    ))
}

// Display actions in a horizontal menu
interface ActionsToMenuProps {
    actions: Action[];
    history: any;
    classes?: { [key: string]: string };
}
export const actionsToMenu = ({ actions, history, classes = { root: '' } }: ActionsToMenuProps) => {
    return actions.map(({ label, value, link, onClick }) => (
        <Button
            key={value}
            variant="text"
            size="large"
            classes={classes}
            onClick={() => { history.push(link); if (onClick) onClick() }}
        >
            {label}
        </Button>
    ));
}

// Display actions in a bottom navigation
interface ActionsToBottomNavProps {
    actions: Action[];
    history: any;
    classes?: { [key: string]: string };
}
export const actionsToBottomNav = ({ actions, history, classes = { root: '' } }: ActionsToBottomNavProps) => {
    return actions.map(({ label, value, link, onClick, Icon, numNotifications }) => (
        <BottomNavigationAction
            key={value}
            classes={classes}
            label={label}
            value={value}
            onClick={() => { history.push(link); if (onClick) onClick() }}
            icon={<Badge badgeContent={numNotifications} color="error"><Icon /></Badge>} />
    ))
}

// Display an action as an icon button
interface ActionToIconButtonProps {
    action: Action;
    history: any;
    classes?: { [key: string]: string };
}
export const actionToIconButton = ({ action, history, classes = { root: '' } }: ActionToIconButtonProps) => {
    const { value, link, Icon, numNotifications } = action;
    return <IconButton classes={classes} edge="start" color="inherit" aria-label={value} onClick={() => history.push(link)}>
        <Badge badgeContent={numNotifications} color="error">
            <Icon />
        </Badge>
    </IconButton>
}