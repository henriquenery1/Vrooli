import { 
    Organization,
    Project,
    Resource,
    RoutineShallow,
    Standard,
    User 
} from 'types';

export interface ActorCardProps {
    data: User;
    onClick?: (id: string) => void;
}

export interface OrganizationCardProps {
    data: Organization;
    onClick?: (id: string) => void;
}

export interface ProjectCardProps {
    data: Project;
    onClick?: (id: string) => void;
}

export interface ResourceCardProps {
    data: Resource;
    onRightClick: (ev: any, data: Resource) => void;
    session: Session;
}

export interface RoutineCardProps {
    data: RoutineShallow;
    onClick?: (id: string) => void;
}

export interface StandardCardProps {
    data: Standard;
    onClick?: (id: string) => void;
}

export interface StatCardProps {
    title?: string;
    data: any;
    index: number;
}