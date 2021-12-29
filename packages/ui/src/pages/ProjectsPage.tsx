import { Button, Typography } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { combineStyles } from 'utils';
import { pageStyles } from './styles';
import { useQuery } from '@apollo/client';
import { projectsQuery } from 'graphql/query';
import { useCallback, useMemo, useState } from 'react';
import { NewProjectDialog, ProjectCard } from 'components';
import { projects, projectsVariables } from 'graphql/generated/projects';
import { Session } from 'types';

const componentStyles = () => ({
    cardFlex: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, .5fr))',
        gridGap: '20px',
    },
})

const useStyles = makeStyles(combineStyles(pageStyles, componentStyles));

interface Props {
    session?: Session
}

export const ProjectsPage = ({
    session
}: Props) => {
    const classes = useStyles();
    const { data: projects } = useQuery<projects, projectsVariables>(projectsQuery, { variables: { input: { userId: session?.id } } })
    // const [newProject] = useMutation<any>(asdf);
    // const [deleteProject] = useMutation<any>(asdf);
    const [newProjectOpen, setNewProjectOpen] = useState(false);
    const openNewProjectDialog = useCallback(() => setNewProjectOpen(true), []);
    const closeNewProjectDialog = useCallback(() => setNewProjectOpen(false), []);

    const cards = useMemo(() => (
        projects?.projects?.edges?.map((edge, index) =>
            <ProjectCard
                key={index}
                data={edge.node}
            />)
    ), [projects])

    return (
        <div id="page">
            <NewProjectDialog open={newProjectOpen} onClose={closeNewProjectDialog} />
            <div className={classes.header}>
                <Typography variant="h3" component="h1">My Projects</Typography>
                <Button onClick={openNewProjectDialog}>New Project</Button>
            </div>
            <div className={classes.cardFlex}>
                {cards}
            </div>
        </div>
    );
}