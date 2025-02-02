import { useCallback, useMemo } from 'react';
import { NodeEdgeProps } from '../types';
import {
    Add as AddIcon,
    AltRoute as BranchIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
} from '@mui/icons-material';
import { IconButton, Stack, Tooltip, useTheme } from '@mui/material';
import { BaseEdge } from '../BaseEdge/BaseEdge';

/**
 * Displays a line between two nodes of a routine graph
 * If in editing mode, displays a clickable button to edit the link or inserting a node
 */
export const NodeEdge = ({
    fastUpdate,
    handleAdd,
    handleBranch,
    handleDelete,
    handleEdit,
    isEditing,
    isFromRoutineList,
    isToRoutineList,
    link,
    scale,
}: NodeEdgeProps) => {
    const { palette } = useTheme();

    // Store dimensions of edge
    const thiccness = useMemo(() => Math.ceil(scale * 30), [scale]);

    // Triggers edit menu in parent. This is needed because the link's from and to nodes
    // can be updated, and the edge doesn't have this information
    const handleEditClick = useCallback(() => {
        handleEdit(link);
    }, [handleEdit, link]);

    /**
     * Place button along bezier to display "Add Node" button
     */
    const popoverT = useMemo(() => {
        // If from and to are both routine lists (or both NOT routine lists), then use bezier midpoint.
        // If one is a routine list and the other is not, use a point further from the routine list
        let t = 0.5;
        if (isFromRoutineList && !isToRoutineList) t = 0.77;
        else if (!isFromRoutineList && isToRoutineList) t = 0.23;
        return t;
    }, [isFromRoutineList, isToRoutineList]);

    /**
     * If isEditable, displays a clickable button for editing the edge or inserting a node
     */
    const popoverComponent = useMemo(() => {
        if (!isEditing) return <></>;
        return (
            <Stack direction="row" spacing={1}>
                {/* Insert Node */}
                <Tooltip title='Insert node'>
                    <IconButton
                        id="insert-node-on-edge-button"
                        size="small"
                        onClick={() => { handleAdd(link) }}
                        aria-label='Insert node on edge'
                        sx={{
                            background: palette.secondary.main,
                            transition: 'brightness 0.2s ease-in-out',
                            '&:hover': {
                                filter: `brightness(105%)`,
                                background: palette.secondary.main,
                            },
                        }}
                    >
                        <AddIcon id="insert-node-on-edge-button-icon" sx={{ fill: 'white' }} />
                    </IconButton>
                </Tooltip>
                {/* Insert Branch */}
                <Tooltip title='Insert branch'>
                    <IconButton
                        id="insert-branch-on-edge-button"
                        size="small"
                        onClick={() => { handleBranch(link) }}
                        aria-label='Insert branch on edge'
                        sx={{
                            background: '#248791',
                            transition: 'brightness 0.2s ease-in-out',
                            '&:hover': {
                                filter: `brightness(105%)`,
                                background: '#248791',
                            },
                        }}
                    >
                        {/* Branch icon should be rotated 90 degrees */}
                        <BranchIcon id="insert-branch-on-edge-button-icon" sx={{ fill: 'white', transform: 'rotate(90deg)' }} />
                    </IconButton>
                </Tooltip>
                {/* Edit Link */}
                <Tooltip title='Edit link'>
                    <IconButton
                        id="edit-edge-button"
                        size="small"
                        onClick={handleEditClick}
                        aria-label='Edit link'
                        sx={{
                            background: '#c5ab17',
                            transition: 'brightness 0.2s ease-in-out',
                            '&:hover': {
                                filter: `brightness(105%)`,
                                background: '#c5ab17',
                            },
                        }}
                    >
                        <EditIcon id="insert-node-on-edge-button-icon" sx={{ fill: 'white' }} />
                    </IconButton>
                </Tooltip>
                {/* Delete link */}
                <Tooltip title='Delete link'>
                    <IconButton
                        id="delete-link-on-edge-button"
                        size="small"
                        onClick={() => { handleDelete(link) }}
                        aria-label='Delete link button'
                        sx={{
                            background: palette.error.main,
                            transition: 'brightness 0.2s ease-in-out',
                            '&:hover': {
                                filter: `brightness(105%)`,
                                background: palette.error.main,
                            },
                        }}
                    >
                        <DeleteIcon id="delete-link-on-edge-button-icon" sx={{ fill: 'white' }} />
                    </IconButton>
                </Tooltip>
            </Stack>
        );
    }, [isEditing, palette.secondary.main, palette.error.main, handleEditClick, handleAdd, link, handleBranch, handleDelete]);

    return <BaseEdge
        containerId='graph-root'
        fromId={`node-${link.fromId}`}
        isEditing={isEditing}
        popoverComponent={popoverComponent}
        popoverT={popoverT}
        thiccness={thiccness}
        timeBetweenDraws={fastUpdate ? 15 : 1000}
        toId={`node-${link.toId}`}
    />
}