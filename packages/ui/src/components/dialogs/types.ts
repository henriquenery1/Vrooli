import { DialogProps } from '@mui/material';
import { HelpButtonProps } from "components/buttons/types";
import { SvgIconComponent } from '@mui/icons-material';
import { DeleteOneType } from '@local/shared';
import { Node, NodeDataRoutineList, NodeDataRoutineListItem, NodeLink, Organization, Project, Resource, Routine, RoutineStep, Run, Session, Standard, User } from 'types';
import { ReportFor } from 'graphql/generated/globalTypes';
import { ObjectType } from 'utils';

export interface BaseObjectDialogProps extends DialogProps {
    children: JSX.Element | JSX.Element[];
    /**
     * Callback when option button or close button is pressed
     */
    onAction: (state: ObjectDialogAction) => any;
    open: boolean;
    title: string;
    zIndex: number;
};

export interface DeleteDialogProps {
    handleClose: (wasDeleted: boolean) => void;
    isOpen: boolean;
    objectId: string;
    objectName: string;
    objectType: DeleteOneType;
    zIndex: number;
}

export interface ListMenuItemData<T> {
    /**
     * Displays help button with data
     */
    helpData?: HelpButtonProps;
    /**
     * Icon to display
     */
    Icon?: SvgIconComponent;
    /**
     * Color of Icon, if different than text
     */
    iconColor?: string;
    /**
     * Text to display
     */
    label: string;
    /**
     * Determines if the item is a preview (i.e. not selectable, coming soon)
     */
    preview?: boolean; // Determines if the item is a preview (i.e. not selectable, coming soon)
    /**
     * Value to pass back when selected
     */
    value: T;
}
export interface ListMenuProps<T> {
    anchorEl: HTMLElement | null;
    data?: ListMenuItemData<T>[];
    id: string;
    onSelect: (value: T) => void;
    onClose: () => void;
    title?: string;
    zIndex: number;
}

export enum ObjectDialogAction {
    Add = 'Add',
    Cancel = 'Cancel',
    Close = 'Close',
    Edit = 'Edit',
    Next = 'Next',
    Previous = 'Previous',
    Save = 'Save',
}

export interface OrganizationDialogProps {
    hasPrevious?: boolean;
    partialData?: Partial<Organization>;
    session: Session;
    zIndex: number;
};

export interface ProjectDialogProps {
    hasPrevious?: boolean;
    partialData?: Partial<Project>;
    session: Session;
    zIndex: number;
};

export interface ReportDialogProps extends DialogProps {
    forId: string;
    onClose: () => any;
    open: boolean;
    reportFor: ReportFor;
    session: Session;
    title?: string;
    zIndex: number;
}

export interface ResourceDialogProps extends DialogProps {
    /**
     * Index in resource list. -1 if new
     */
    index: number;
    listId: string;
    /**
     * Determines if add resource should be called by this dialog, or is handled later
     */
    mutate: boolean;
    onClose: () => any;
    onCreated: (resource: Resource) => any;
    open: boolean;
    onUpdated: (index: number, resource: Resource) => any;
    partialData?: Partial<Resource>;
    session: Session;
    zIndex: number;
}

export interface RoutineDialogProps {
    partialData?: Partial<Routine>;
    session: Session;
    zIndex: number;
};

export interface ShareDialogProps extends DialogProps {
    open: boolean;
    onClose: () => any;
    zIndex: number;
}

export interface StandardDialogProps {
    partialData?: Partial<Standard>;
    session: Session;
    zIndex: number;
};

export interface UserDialogProps {
    partialData?: Partial<User>;
    session: Session;
    zIndex: number;
};

/**
 * All available actions an object can possibly have
 */
export enum BaseObjectAction {
    Copy = 'Copy',
    Delete = "Delete",
    Donate = "Donate",
    Downvote = "Downvote",
    Edit = "Edit",
    Fork = "Fork",
    Report = "Report",
    Share = "Share",
    Star = "Star",
    Stats = "Stats",
    Unstar = "Unstar",
    Update = "Update", // Not a synonym for edit. Used when COMPLETING an edit
    UpdateCancel = "UpdateCancel",
    Upvote = "Upvote",
}

export interface BaseObjectActionDialogProps {
    anchorEl: HTMLElement | null;
    handleActionComplete: (action: BaseObjectAction, data: any) => any;
    handleEdit: () => any;
    isUpvoted: boolean | null | undefined;
    isStarred: boolean | null | undefined;
    objectId: string;
    objectName: string;
    objectType: ObjectType;
    onClose: () => any;
    permissions: {
        canDelete?: boolean;
        canEdit?: boolean;
        canFork?: boolean;
        canReport?: boolean;
        canStar?: boolean;
        canVote?: boolean;
    } | null | undefined
    session: Session;
    title: string;
    zIndex: number;
}

export interface LinkDialogProps {
    handleClose: (newLink?: NodeLink) => void;
    handleDelete: (link: NodeLink) => void;
    isAdd: boolean;
    isOpen: boolean;
    language: string; // Language to display/edit
    link?: NodeLink; // Link to display on open, if editing
    nodeFrom?: Node | null; // Initial "from" node
    nodeTo?: Node | null; // Initial "to" node
    routine: Routine;
    zIndex: number;
}

export interface BuildInfoDialogProps {
    handleAction: (action: BaseObjectAction, data: any) => any;
    handleLanguageChange: (newLanguage: string) => any;
    handleUpdate: (routine: Routine) => any;
    isEditing: boolean;
    language: string;
    loading: boolean;
    routine: Routine | null;
    session: Session;
    sxs?: { icon: any, iconButton: any };
    zIndex: number;
}

export interface SubroutineInfoDialogProps {
    data: { node: NodeDataRoutineList, routineItemId: string } | null;
    defaultLanguage: string;
    handleUpdate: (updatedSubroutine: NodeDataRoutineListItem) => any;
    handleReorder: (nodeId: string, oldIndex: number, newIndex: number) => any;
    handleViewFull: () => any;
    isEditing: boolean;
    open: boolean;
    session: Session;
    onClose: () => any;
    zIndex: number;
}

export interface UnlinkedNodesDialogProps {
    handleNodeDelete: (nodeId: string) => any;
    /**
     * Expand/shrink dialog
     */
    handleToggleOpen: () => any;
    language: string;
    nodes: Node[];
    open: boolean;
    zIndex: number;
}

export interface RunStepsDialogProps {
    handleLoadSubroutine: (id: string) => any;
    handleCurrStepLocationUpdate: (step: number[]) => any;
    history: Array<number>[];
    /**
     * Out of 100
     */
    percentComplete: number;
    stepList: RoutineStep | null;
    sxs?: { icon: any };
    zIndex: number;
}

export interface SelectLanguageDialogProps {
    /**
     * Languages to restrict selection to
     */
    availableLanguages?: string[];
    /**
     * While there may be multiple selected languages, 
     * there is only ever one current language
     */
    currentLanguage: string;
    canDropdownOpen?: boolean;
    handleDelete?: (language: string) => any;
    /**
     * Callback when new current language is selected
     */
    handleCurrent: (language: string) => any;
    isEditing?: boolean;
    /**
     * Contains user's languages. These are displayed at the top of the language selection list
     */
    session: Session;
    /**
     * Currently selected languages. Display with check marks. 
     * If not provided, defaults to curentLanguage
     */
    selectedLanguages?: string[];
    sxs?: { root: any };
    zIndex: number;
}

export interface AdvancedSearchDialogProps {
    handleClose: () => any;
    handleSearch: (searchQuery: { [x: string]: any }) => any;
    isOpen: boolean;
    session: Session;
    zIndex: number;
}

export interface RunPickerDialogProps {
    anchorEl: HTMLElement | null;
    handleClose: () => any;
    onAdd: (run: Run) => any;
    onDelete: (run: Run) => any;
    onSelect: (run: Run | null) => any;
    routine?: Routine | null;
    session: Session;
}

export interface WalletInstallDialogProps {
    onClose: () => any;
    open: boolean;
    zIndex: number;
}

export interface WalletSelectDialogProps {
    handleOpenInstall: () => any;
    onClose: (selectedKey: string | null) => any;
    open: boolean;
    zIndex: number;
}