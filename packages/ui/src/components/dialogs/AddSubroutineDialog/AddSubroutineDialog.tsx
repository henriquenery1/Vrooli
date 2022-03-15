/**
 * Used to create/update a link between two routine nodes
 */
import {
    Box,
    Button,
    Dialog,
    DialogContent,
    IconButton,
    Stack,
    Typography
} from '@mui/material';
import { BaseObjectDialog, HelpButton } from 'components';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { AddSubroutineDialogProps } from '../types';
import {
    Add as CreateIcon,
    Close as CloseIcon
} from '@mui/icons-material';
import { Routine } from 'types';
import { Pubs } from 'utils';
import { routineDefaultSortOption, RoutineListItem, routineOptionLabel, RoutineSortOptions, SearchList } from 'components/lists';
import { routineQuery, routinesQuery } from 'graphql/query';
import { useLazyQuery } from '@apollo/client';
import { routine, routineVariables } from 'graphql/generated/routine';
import { RoutineCreate } from 'components/views/RoutineCreate/RoutineCreate';

const helpText =
    `
TODO
`

export const AddSubroutineDialog = ({
    handleAdd,
    handleClose,
    isOpen,
    language,
    nodeId,
    routineId,
    session,
}: AddSubroutineDialogProps) => {

    // Create new routine dialog
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const handleCreateOpen = useCallback(() => { setIsCreateOpen(true); }, [setIsCreateOpen]);
    const handleCreated = useCallback((routine: Routine) => {
        setIsCreateOpen(false);
        handleAdd(nodeId, routine);
        handleClose();
    }, [handleAdd, handleClose]);
    const handleCreateClose = useCallback(() => {
        setIsCreateOpen(false);
    }, [setIsCreateOpen]);

    // If routine selected from search, query for full data
    const [getRoutine, { data: routineData, loading }] = useLazyQuery<routine, routineVariables>(routineQuery);
    const handleRoutineSelect = useCallback((routine: Routine) => {
        console.log('handle select', routine);
        getRoutine({ variables: { input: { id: routine.id } } });
    }, [getRoutine]);
    useEffect(() => {
        if (routineData?.routine) {
            handleAdd(nodeId, routineData.routine);
            handleClose();
        } else {
            PubSub.publish(Pubs.Snack, { message: 'Failed to fetch routine data.', severity: 'error' });
        }
    }, [routineData, handleCreateClose]);

    /**
     * Title bar with help button and close icon
     */
    const titleBar = useMemo(() => (
        <Box sx={{
            background: (t) => t.palette.primary.dark,
            color: (t) => t.palette.primary.contrastText,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: 2,
        }}>
            <Typography component="h2" variant="h4" textAlign="center" sx={{ marginLeft: 'auto' }}>
                {'Add Subroutine'}
            </Typography>
            <Box sx={{ marginLeft: 'auto' }}>
                <HelpButton markdown={helpText} sx={{ fill: '#a0e7c4' }} />
                <IconButton
                    edge="start"
                    onClick={(e) => { handleClose() }}
                >
                    <CloseIcon sx={{ fill: (t) => t.palette.primary.contrastText }} />
                </IconButton>
            </Box>
        </Box>
    ), [])

    const [searchString, setSearchString] = useState<string>('');
    const [sortBy, setSortBy] = useState<string | undefined>(undefined);
    const [timeFrame, setTimeFrame] = useState<string | undefined>(undefined);

    return (
        <Dialog
            open={isOpen}
            onClose={handleClose}
            sx={{
                '& .MuiDialogContent-root': { overflow: 'visible', background: '#cdd6df' },
                '& .MuiDialog-paper': { overflow: 'visible' }
            }}
        >
            {/* Popup for creating a new routine */}
            <BaseObjectDialog
                title={"Create Routine"}
                open={isCreateOpen}
                hasPrevious={false}
                hasNext={false}
                onAction={handleCreateClose}
            >
                <RoutineCreate
                    session={session}
                    onCreated={handleCreated}
                    onCancel={handleCreateClose}
                />
            </BaseObjectDialog>
            {titleBar}
            <DialogContent>
                <Stack direction="column" spacing={4}>
                    <Button
                        fullWidth
                        startIcon={<CreateIcon />}
                        onClick={handleCreateOpen}
                    >Create</Button>
                    <Box sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                    }}>
                        <Typography variant="h6" sx={{ marginLeft: 'auto', marginRight: 'auto' }}>Or</Typography>
                    </Box>
                    <SearchList
                        searchPlaceholder={'Select existing subroutine...'}
                        sortOptions={RoutineSortOptions}
                        defaultSortOption={routineDefaultSortOption}
                        query={routinesQuery}
                        where={{ excludeIds: [routineId] }}
                        take={20}
                        searchString={searchString}
                        sortBy={sortBy}
                        timeFrame={timeFrame}
                        noResultsText={"None found. Maybe you should create one?"}
                        setSearchString={setSearchString}
                        setSortBy={setSortBy}
                        setTimeFrame={setTimeFrame}
                        listItemFactory={(node: Routine, index: number) => (
                            <RoutineListItem
                                key={`routine-list-item-${index}`}
                                index={index}
                                session={session}
                                data={node}
                                onClick={(_e, selected: Routine) => handleRoutineSelect(selected)}
                            />)}
                        getOptionLabel={routineOptionLabel}
                        onObjectSelect={(newValue) => handleRoutineSelect(newValue)}
                    />
                </Stack>
            </DialogContent>
        </Dialog>
    )
}