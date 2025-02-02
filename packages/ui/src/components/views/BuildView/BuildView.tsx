import { Box, IconButton, Stack, Tooltip, Typography, useTheme } from '@mui/material';
import { LinkDialog, NodeGraph, BuildBottomContainer, SubroutineInfoDialog, SubroutineSelectOrCreateDialog, AddAfterLinkDialog, AddBeforeLinkDialog, EditableLabel, UnlinkedNodesDialog, BuildInfoDialog, HelpButton } from 'components';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useMutation } from '@apollo/client';
import { routineCreateMutation, routineUpdateMutation } from 'graphql/mutation';
import { mutationWrapper } from 'graphql/utils/mutationWrapper';
import { deleteArrayIndex, BuildAction, BuildRunState, Status, updateArray, getTranslation, getUserLanguages, parseSearchParams, stringifySearchParams, TERTIARY_COLOR, shapeRoutineUpdate, shapeRoutineCreate, NodeShape, NodeLinkShape, PubSub, getRoutineStatus, initializeRoutine } from 'utils';
import { Node, NodeDataRoutineList, NodeDataRoutineListItem, NodeLink, Routine, Run } from 'types';
import { useLocation } from 'wouter';
import { APP_LINKS, isEqual } from '@local/shared';
import { NodeType } from 'graphql/generated/globalTypes';
import { BaseObjectAction } from 'components/dialogs/types';
import { BuildViewProps } from '../types';
import {
    AddLink as AddLinkIcon,
    Close as CloseIcon,
    Compress as CleanUpIcon,
    Edit as EditIcon,
} from '@mui/icons-material';
import { v4 as uuid, validate as uuidValidate } from 'uuid';
import { StatusMessageArray } from 'components/buttons/types';
import { StatusButton } from 'components/buttons';
import { routineUpdate, routineUpdateVariables } from 'graphql/generated/routineUpdate';
import { routineCreate, routineCreateVariables } from 'graphql/generated/routineCreate';
import { MoveNodeMenu as MoveNodeDialog } from 'components/graphs/NodeGraph/MoveNodeDialog/MoveNodeDialog';

//TODO
const helpText =
    `## What am I looking at?
Lorem ipsum dolor sit amet consectetur adipisicing elit. 


## How does it work?
Lorem ipsum dolor sit amet consectetur adipisicing elit.
`

/**
 * Generates a new link object, but doesn't add it to the routine
 * @param fromId - The ID of the node the link is coming from
 * @param toId - The ID of the node the link is going to
 * @returns The new link object
 */
const generateNewLink = (fromId: string, toId: string): NodeLinkShape => ({
    __typename: 'NodeLink',
    id: uuid(),
    fromId,
    toId,
})

export const BuildView = ({
    handleClose,
    loading,
    onChange,
    routine,
    session,
    zIndex,
}: BuildViewProps) => {
    const { palette } = useTheme();
    const [, setLocation] = useLocation();
    const id: string = useMemo(() => routine?.id ?? '', [routine]);
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [language, setLanguage] = useState<string>(getUserLanguages(session)[0]);

    /**
     * On page load, check if editing
     */
    useEffect(() => {
        const searchParams = parseSearchParams(window.location.search);
        // If edit param is set or build param is not a valid id, set editing to true
        if (searchParams.edit || !uuidValidate(searchParams.build ? `${searchParams.build}` : '')) {
            setIsEditing(true);
        }
    }, []);

    /**
     * Before closing, remove build-related url params
     */
    const removeSearchParams = useCallback(() => {
        const params = parseSearchParams(window.location.search);
        if (params.build) delete params.build;
        if (params.edit) delete params.edit;
        setLocation(stringifySearchParams(params), { replace: true });
    }, [setLocation]);

    const [changedRoutine, setChangedRoutine] = useState<Routine | null>(null);
    // Routine mutators
    const [routineCreate] = useMutation<routineCreate, routineCreateVariables>(routineCreateMutation);
    const [routineUpdate] = useMutation<routineUpdate, routineUpdateVariables>(routineUpdateMutation);
    // The routine's status (valid/invalid/incomplete)
    const [status, setStatus] = useState<StatusMessageArray>({ status: Status.Incomplete, messages: ['Calculating...'] });
    // Determines the size of the nodes and edges
    const [scale, setScale] = useState<number>(1);
    const canEdit = useMemo<boolean>(() => routine?.permissionsRoutine?.canEdit === true, [routine?.permissionsRoutine?.canEdit]);

    useEffect(() => {
        setChangedRoutine(routine);
        // Update language
        if (routine) {
            const userLanguages = getUserLanguages(session);
            const routineLanguages = routine?.translations?.map(t => t.language)?.filter(l => typeof l === 'string' && l.length > 1) ?? [];
            // Find the first language in the user's languages that is also in the routine's languages
            const lang = userLanguages.find(l => routineLanguages.includes(l));
            if (lang) setLanguage(lang);
            else if (routineLanguages.length > 0) setLanguage(routineLanguages[0]);
            else setLanguage(userLanguages[0]);
        }
    }, [routine, session]);

    // Add subroutine dialog
    const [addSubroutineNode, setAddSubroutineNode] = useState<string | null>(null);
    const closeAddSubroutineDialog = useCallback(() => { setAddSubroutineNode(null); }, []);

    // "Add after" link dialog when there is more than one link (i.e. can't be done automatically)
    const [addAfterLinkNode, setAddAfterLinkNode] = useState<string | null>(null);
    const closeAddAfterLinkDialog = useCallback(() => { setAddAfterLinkNode(null); }, []);

    // "Add before" link dialog when there is more than one link (i.e. can't be done automatically)
    const [addBeforeLinkNode, setAddBeforeLinkNode] = useState<string | null>(null);
    const closeAddBeforeLinkDialog = useCallback(() => { setAddBeforeLinkNode(null); }, []);

    /**
     * Calculates:
     * - 2D array of positioned nodes data (to represent columns and rows)
     * - 1D array of unpositioned nodes data
     * - dictionary of positioned node IDs to their data
     * Also sets the status of the routine (valid/invalid/incomplete)
     */
    const { columns, nodesOffGraph, nodesById } = useMemo(() => {
        if (!changedRoutine) return { columns: [], nodesOffGraph: [], nodesById: {} };
        const { messages, nodesById, nodesOnGraph, nodesOffGraph, status } = getRoutineStatus(changedRoutine);
        // Check for critical errors
        if (messages.includes('No node or link data found')) {
            // Create new routine data
            const initialized = initializeRoutine(language);
            // Set empty nodes and links
            setChangedRoutine({
                ...changedRoutine,
                nodes: initialized.nodes,
                nodeLinks: initialized.nodeLinks,
            });
            return { columns: [], nodesOffGraph: [], nodesById: {} };
        }
        if (messages.includes('Ran into error determining node positions')) {
            // Remove all node positions and links
            setChangedRoutine({
                ...changedRoutine,
                nodes: changedRoutine.nodes.map(n => ({ ...n, columnIndex: null, rowIndex: null })),
                nodeLinks: [],
            })
            return { columns: [], nodesOffGraph: changedRoutine.nodes, nodesById: {} };
        }
        // Update status
        setStatus({ status, messages });
        // Remove any links which reference unlinked nodes
        const goodLinks = changedRoutine.nodeLinks.filter(link => !nodesOffGraph.some(node => node.id === link.fromId || node.id === link.toId));
        // If routine was mutated, update the routine
        const finalNodes = [...nodesOnGraph, ...nodesOffGraph]
        const haveNodesChanged = !isEqual(finalNodes, changedRoutine.nodes);
        const haveLinksChanged = !isEqual(goodLinks, changedRoutine.nodeLinks);
        if (haveNodesChanged || haveLinksChanged) {
            setChangedRoutine({
                ...changedRoutine,
                nodes: finalNodes,
                nodeLinks: goodLinks,
            })
        }
        // Create 2D node data array, ordered by column. Each column is ordered by row index
        const columns: Node[][] = [];
        // Loop through positioned nodes
        for (const node of nodesOnGraph) {
            // Skips nodes without a columnIndex or rowIndex
            if ((node.columnIndex === null || node.columnIndex === undefined) || (node.rowIndex === null || node.rowIndex === undefined)) continue;
            // Add new column(s) if necessary
            while (columns.length <= node.columnIndex) {
                columns.push([]);
            }
            // Add node to column
            columns[node.columnIndex].push(node);
        }
        // Now sort each column by row index
        for (const column of columns) {
            column.sort((a, b) => (a.rowIndex ?? 0) - (b.rowIndex ?? 0));
        }
        // Add one empty column to the end, so nodes, can be dragged to the end of the graph
        columns.push([]);
        // Return
        return { columns, nodesOffGraph, nodesById };
    }, [changedRoutine, language]);

    // Subroutine info drawer
    const [openedSubroutine, setOpenedSubroutine] = useState<{ node: NodeDataRoutineList, routineItemId: string } | null>(null);
    const handleSubroutineOpen = useCallback((nodeId: string, subroutineId: string) => {
        const node = nodesById[nodeId];
        if (node) setOpenedSubroutine({ node: (node.data as NodeDataRoutineList), routineItemId: subroutineId });
    }, [nodesById]);
    const closeRoutineInfo = useCallback(() => {
        setOpenedSubroutine(null);
    }, []);

    const [isLinkDialogOpen, setIsLinkDialogOpen] = useState(false);
    const [linkDialogFrom, setLinkDialogFrom] = useState<Node | null>(null);
    const [linkDialogTo, setLinkDialogTo] = useState<Node | null>(null);
    const openLinkDialog = useCallback(() => setIsLinkDialogOpen(true), []);
    const handleLinkDialogClose = useCallback((link?: NodeLink) => {
        setLinkDialogFrom(null);
        setLinkDialogTo(null);
        setIsLinkDialogOpen(false);
        if (!changedRoutine) return;
        // If no link data, return
        if (!link) return;
        // Upsert link
        const newLinks = [...changedRoutine.nodeLinks];
        const existingLinkIndex = newLinks.findIndex(l => l.fromId === link.fromId && l.toId === link.toId);
        if (existingLinkIndex >= 0) {
            newLinks[existingLinkIndex] = { ...link } as NodeLink;
        } else {
            newLinks.push(link as NodeLink);
        }
        setChangedRoutine({
            ...changedRoutine,
            nodeLinks: newLinks,
        });
    }, [changedRoutine]);

    /**
     * Deletes a link, without deleting any nodes.
     */
    const handleLinkDelete = useCallback((link: NodeLink) => {
        if (!changedRoutine) return;
        setChangedRoutine({
            ...changedRoutine,
            nodeLinks: changedRoutine.nodeLinks.filter(l => l.id !== link.id),
        });
    }, [changedRoutine]);

    const handleScaleChange = (newScale: number) => { 
        PubSub.get().publishFastUpdate({ duration: 1000 });
        setScale(newScale) 
    };
    const handleScaleDelta = useCallback((delta: number) => {
        PubSub.get().publishFastUpdate({ duration: 1000 });
        setScale(s => Math.max(0.25, Math.min(1, s + delta)));
    }, []);

    const handleRunDelete = useCallback((run: Run) => {
        if (!changedRoutine) return;
        setChangedRoutine({
            ...changedRoutine,
            runs: changedRoutine.runs.filter(r => r.id !== run.id),
        });
    }, [changedRoutine]);

    const handleRunAdd = useCallback((run: Run) => {
        if (!changedRoutine) return;
        setChangedRoutine({
            ...changedRoutine,
            runs: [run, ...changedRoutine.runs],
        });
    }, [changedRoutine]);

    const startEditing = useCallback(() => setIsEditing(true), []);
    /**
     * Creates new routine
     */
    const createRoutine = useCallback(() => {
        if (!changedRoutine) {
            return;
        }
        mutationWrapper({
            mutation: routineCreate,
            input: shapeRoutineCreate({ ...changedRoutine, id: uuid() }),
            successMessage: () => 'Routine created.',
            onSuccess: ({ data }) => {
                onChange(data.routineCreate);
                removeSearchParams();
                handleClose(true);
            },
        })
    }, [changedRoutine, handleClose, onChange, removeSearchParams, routineCreate]);

    /**
     * Mutates routine data
     */
    const updateRoutine = useCallback(() => {
        if (!changedRoutine || isEqual(routine, changedRoutine)) {
            PubSub.get().publishSnack({ message: 'No changes detected', severity: 'error' });
            return;
        }
        if (!routine || !changedRoutine.id) {
            PubSub.get().publishSnack({ message: 'Cannot update: Invalid routine data', severity: 'error' });
            return;
        }
        mutationWrapper({
            mutation: routineUpdate,
            input: shapeRoutineUpdate(routine, changedRoutine),
            successMessage: () => 'Routine updated.',
            onSuccess: ({ data }) => {
                // Update main routine object
                onChange(data.routineUpdate);
                // Remove indication of editing from URL
                const params = parseSearchParams(window.location.search);
                if (params.edit) delete params.edit;
                setLocation(stringifySearchParams(params), { replace: true });
                // Turn off editing mode
                setIsEditing(false);
            },
        })
    }, [changedRoutine, onChange, routine, routineUpdate, setLocation])

    /**
     * If closing with unsaved changes, prompt user to save
     */
    const onClose = useCallback(() => {
        if (isEditing && JSON.stringify(routine) !== JSON.stringify(changedRoutine)) {
            PubSub.get().publishAlertDialog({
                message: 'There are unsaved changes. Would you like to save before exiting?',
                buttons: [
                    {
                        text: 'Save', onClick: () => {
                            updateRoutine();
                            removeSearchParams();
                            handleClose(true);
                        }
                    },
                    {
                        text: "Don't Save", onClick: () => {
                            removeSearchParams();
                            handleClose(false);
                        }
                    },
                ]
            });
        } else {
            removeSearchParams();
            handleClose(false);
        }
    }, [changedRoutine, handleClose, isEditing, removeSearchParams, routine, updateRoutine]);

    /**
     * On page leave, check if routine has changed. 
     * If so, prompt user to save changes
     */
    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (isEditing && JSON.stringify(routine) !== JSON.stringify(changedRoutine)) {
                e.preventDefault()
                e.returnValue = ''
            }
        };
        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [changedRoutine, isEditing, routine, updateRoutine]);

    const updateRoutineTitle = useCallback((title: string) => {
        if (!changedRoutine) return;
        const newTranslations = [...changedRoutine.translations.map(t => {
            if (t.language === language) {
                return { ...t, title }
            }
            return { ...t }
        })];
        setChangedRoutine({
            ...changedRoutine,
            translations: newTranslations
        });
    }, [changedRoutine, language]);

    const revertChanges = useCallback(() => {
        // Confirm if changes have been made
        if (JSON.stringify(routine) !== JSON.stringify(changedRoutine)) {
            PubSub.get().publishAlertDialog({
                message: 'There are unsaved changes. Are you sure you would like to cancel?',
                buttons: [
                    {
                        text: 'Yes', onClick: () => {
                            // If updating routine, revert to original routine
                            if (id) {
                                setChangedRoutine(routine);
                                setIsEditing(false);
                            }
                            // If adding new routine, go back
                            else window.history.back();
                        }
                    },
                    {
                        text: "No", onClick: () => { }
                    },
                ]
            });
        }
    }, [changedRoutine, id, routine])

    /**
     * Calculates the new set of links for an routine when a node is 
     * either deleted or unlinked. In certain cases, the new links can be 
     * calculated automatically.
     * @param nodeId - The ID of the node which is being deleted or unlinked
     * @param currLinks - The current set of links
     * @returns The new set of links
     */
    const calculateLinksAfterNodeRemove = useCallback((nodeId: string): NodeLink[] => {
        if (!changedRoutine) return [];
        const deletingLinks = changedRoutine.nodeLinks.filter(l => l.fromId === nodeId || l.toId === nodeId);
        const newLinks: NodeLinkShape[] = [];
        // Find all "from" and "to" nodes in the deleting links
        const fromNodeIds = deletingLinks.map(l => l.fromId).filter(id => id !== nodeId);
        const toNodeIds = deletingLinks.map(l => l.toId).filter(id => id !== nodeId);
        // If there is only one "from" node, create a link between it and every "to" node
        if (fromNodeIds.length === 1) {
            toNodeIds.forEach(toId => { newLinks.push(generateNewLink(fromNodeIds[0], toId)) });
        }
        // If there is only one "to" node, create a link between it and every "from" node
        else if (toNodeIds.length === 1) {
            fromNodeIds.forEach(fromId => { newLinks.push(generateNewLink(fromId, toNodeIds[0])) });
        }
        // NOTE: Every other case is ambiguous, so we can't auto-create create links
        // Delete old links
        let keptLinks = changedRoutine.nodeLinks.filter(l => !deletingLinks.includes(l));
        // Return new links combined with kept links
        return [...keptLinks, ...newLinks as any[]];
    }, [changedRoutine]);

    /**
     * Finds the closest node position available to the given position
     * @param column - The preferred column
     * @param row - The preferred row
     * @returns a node position in the same column, with the first available row starting at the given row
     */
    const closestOpenPosition = useCallback((
        column: number | null,
        row: number | null
    ): { columnIndex: number, rowIndex: number } => {
        if (column === null || row === null) return { columnIndex: -1, rowIndex: -1 };
        const columnNodes = changedRoutine?.nodes?.filter(n => n.columnIndex === column) ?? [];
        let rowIndex: number = row;
        // eslint-disable-next-line no-loop-func
        while (columnNodes.some(n => n.rowIndex !== null && n.rowIndex === rowIndex) && rowIndex <= 100) {
            rowIndex++;
        }
        if (rowIndex > 100) return { columnIndex: -1, rowIndex: -1 };
        return { columnIndex: column, rowIndex };
    }, [changedRoutine?.nodes]);

    /**
     * Generates a new routine list node object, but doesn't add it to the routine
     * @param column Suggested column for the node
     * @param row Suggested row for the node
     */
    const createRoutineListNode = useCallback((column: number | null, row: number | null) => {
        const { columnIndex, rowIndex } = closestOpenPosition(column, row);
        const newNode: Omit<NodeShape, 'routineId'> = {
            __typename: 'Node',
            id: uuid(),
            type: NodeType.RoutineList,
            rowIndex,
            columnIndex,
            data: {
                id: uuid(),
                __typename: 'NodeRoutineList',
                isOrdered: false,
                isOptional: false,
                routines: [],
            },
            // Generate unique placeholder title
            translations: [{
                __typename: 'NodeTranslation',
                id: uuid(),
                language,
                title: `Node ${(changedRoutine?.nodes?.length ?? 0) - 1}`,
                description: '',
            }],
        }
        return newNode;
    }, [closestOpenPosition, language, changedRoutine?.nodes?.length]);

    /**
     * Generates new end node object, but doesn't add it to the routine
     * @param column Suggested column for the node
     * @param row Suggested row for the node
     */
    const createEndNode = useCallback((column: number | null, row: number | null) => {
        const { columnIndex, rowIndex } = closestOpenPosition(column, row);
        const newNode: Omit<NodeShape, 'routineId'> = {
            __typename: 'Node',
            id: uuid(),
            type: NodeType.End,
            rowIndex,
            columnIndex,
            data: {
                id: uuid(),
                wasSuccessful: true,
            },
            translations: []
        }
        return newNode;
    }, [closestOpenPosition]);

    /**
     * Creates a link between two nodes which already exist in the linked routine. 
     * This assumes that the link is valid.
     */
    const handleLinkCreate = useCallback((link: NodeLink) => {
        if (!changedRoutine) return;
        setChangedRoutine({
            ...changedRoutine,
            nodeLinks: [...changedRoutine.nodeLinks, link]
        });
    }, [changedRoutine]);

    /**
     * Updates an existing link between two nodes
     */
    const handleLinkUpdate = useCallback((link: NodeLink) => {
        if (!changedRoutine) return;
        const linkIndex = changedRoutine.nodeLinks.findIndex(l => l.id === link.id);
        if (linkIndex === -1) return;
        setChangedRoutine({
            ...changedRoutine,
            nodeLinks: updateArray(changedRoutine.nodeLinks, linkIndex, link),
        });
    }, [changedRoutine]);

    /**
     * Deletes a node, and all links connected to it. 
     * Also attemps to create new links to replace the deleted links.
     */
    const handleNodeDelete = useCallback((nodeId: string) => {
        if (!changedRoutine) return;
        const nodeIndex = changedRoutine.nodes.findIndex(n => n.id === nodeId);
        if (nodeIndex === -1) return;
        const linksList = calculateLinksAfterNodeRemove(nodeId);
        setChangedRoutine({
            ...changedRoutine,
            nodes: deleteArrayIndex(changedRoutine.nodes, nodeIndex),
            nodeLinks: linksList,
        });
    }, [calculateLinksAfterNodeRemove, changedRoutine]);

    /**
     * Deletes a subroutine from a node
     */
    const handleSubroutineDelete = useCallback((nodeId: string, subroutineId: string) => {
        if (!changedRoutine) return;
        const nodeIndex = changedRoutine.nodes.findIndex(n => n.id === nodeId);
        if (nodeIndex === -1) return;
        const node = changedRoutine.nodes[nodeIndex];
        const subroutineIndex = (node.data as NodeDataRoutineList).routines.findIndex((item: NodeDataRoutineListItem) => item.id === subroutineId);
        if (subroutineIndex === -1) return;
        const newRoutineList = deleteArrayIndex((node.data as NodeDataRoutineList).routines, subroutineIndex);
        setChangedRoutine({
            ...changedRoutine,
            nodes: updateArray(changedRoutine.nodes, nodeIndex, {
                ...node,
                data: {
                    ...node.data,
                    routines: newRoutineList,
                }
            }),
        });
    }, [changedRoutine]);

    /**
     * Drops or unlinks a node
     */
    const handleNodeDrop = useCallback((nodeId: string, columnIndex: number | null, rowIndex: number | null) => {
        if (!changedRoutine) return;
        const nodeIndex = changedRoutine.nodes.findIndex(n => n.id === nodeId);
        if (nodeIndex === -1) return;
        // If columnIndex and rowIndex null, then it is being unlinked
        if (columnIndex === null && rowIndex === null) {
            const linksList = calculateLinksAfterNodeRemove(nodeId);
            setChangedRoutine({
                ...changedRoutine,
                nodes: updateArray(changedRoutine.nodes, nodeIndex, {
                    ...changedRoutine.nodes[nodeIndex],
                    rowIndex: null,
                    columnIndex: null,
                }),
                nodeLinks: linksList,
            });
            return;
        }
        // If one or the other is null, then there must be an error
        if (columnIndex === null || rowIndex === null) {
            PubSub.get().publishSnack({ message: 'Error: Invalid drop location.', severity: 'errror' });
            return;
        }
        // Otherwise, is a drop
        let updatedNodes = [...changedRoutine.nodes];
        // If dropped into the first column, then shift everything that's not the start node to the right
        if (columnIndex === 0) {
            updatedNodes = updatedNodes.map(n => {
                if (n.rowIndex === null || n.columnIndex === null || n.columnIndex === 0) return n;
                return {
                    ...n,
                    columnIndex: n.columnIndex + 1,
                }
            });
            // Update dropped node
            updatedNodes = updateArray(updatedNodes, nodeIndex, {
                ...changedRoutine.nodes[nodeIndex],
                columnIndex: 1,
                rowIndex,
            });
        }
        // If dropped into the same column the node started in, either shift or swap
        else if (columnIndex === changedRoutine.nodes[nodeIndex].columnIndex) {
            // Find and order nodes in the same column, which are above (or at the same position as) the dropped node
            const nodesAbove = changedRoutine.nodes.filter(n =>
                n.columnIndex === columnIndex &&
                n.rowIndex !== null &&
                n.rowIndex <= rowIndex
            ).sort((a, b) => (a.rowIndex ?? 0) - (b.rowIndex ?? 0));
            // If no nodes above, then shift everything in the column down by 1
            if (nodesAbove.length === 0) {
                updatedNodes = updatedNodes.map(n => {
                    if (n.rowIndex === null || n.columnIndex !== columnIndex) return n;
                    return {
                        ...n,
                        rowIndex: n.rowIndex + 1,
                    }
                });
            }
            // Otherwise, swap with the last node in the above list
            else {
                updatedNodes = updatedNodes.map(n => {
                    if (n.rowIndex === null || n.columnIndex !== columnIndex) return n;
                    if (n.id === nodeId) return {
                        ...n,
                        rowIndex: nodesAbove[nodesAbove.length - 1].rowIndex,
                    }
                    if (n.rowIndex === nodesAbove[nodesAbove.length - 1].rowIndex) return {
                        ...n,
                        rowIndex: changedRoutine.nodes[nodeIndex].rowIndex,
                    }
                    return n;
                });
            }
        }
        // Otherwise, treat as a normal drop
        else {
            // If dropped into an existing column, shift rows in dropped column that are below the dropped node
            if (changedRoutine.nodes.some(n => n.columnIndex === columnIndex)) {
                updatedNodes = updatedNodes.map(n => {
                    if (n.columnIndex === columnIndex && n.rowIndex !== null && n.rowIndex >= rowIndex) {
                        return { ...n, rowIndex: n.rowIndex + 1 }
                    }
                    return n;
                });
            }
            // If the column the node was from is now empty, then shift all columns after it.
            const originalColumnIndex = changedRoutine.nodes[nodeIndex].columnIndex;
            const isRemovingColumn = originalColumnIndex !== null && changedRoutine.nodes.filter(n => n.columnIndex === originalColumnIndex).length === 1;
            if (isRemovingColumn) {
                updatedNodes = updatedNodes.map(n => {
                    if (n.columnIndex !== null && n.columnIndex > originalColumnIndex) {
                        return { ...n, columnIndex: n.columnIndex - 1 }
                    }
                    return n;
                });
            }
            updatedNodes = updateArray(updatedNodes, nodeIndex, {
                ...changedRoutine.nodes[nodeIndex],
                columnIndex: (isRemovingColumn && originalColumnIndex < columnIndex) ?
                    columnIndex - 1 :
                    columnIndex,
                rowIndex,
            })
        }
        // Update the routine
        setChangedRoutine({
            ...changedRoutine,
            nodes: updatedNodes,
        });
    }, [calculateLinksAfterNodeRemove, changedRoutine]);

    // Move node dialog for context menu (mainly for accessibility)
    const [moveNode, setMoveNode] = useState<Node | null>(null);
    const closeMoveNodeDialog = useCallback((newPosition?: { columnIndex: number, rowIndex: number }) => {
        if (newPosition && moveNode) {
            handleNodeDrop(moveNode.id, newPosition.columnIndex, newPosition.rowIndex);
        }
        setMoveNode(null);
    }, [handleNodeDrop, moveNode]);

    /**
     * Updates a node's data
     */
    const handleNodeUpdate = useCallback((node: Node) => {
        if (!changedRoutine) return;
        const nodeIndex = changedRoutine.nodes.findIndex(n => n.id === node.id);
        if (nodeIndex === -1) return;
        setChangedRoutine({
            ...changedRoutine,
            nodes: updateArray(changedRoutine.nodes, nodeIndex, node),
        });
    }, [changedRoutine]);

    /**
     * Inserts a new routine list node along an edge
     */
    const handleNodeInsert = useCallback((link: NodeLink) => {
        if (!changedRoutine) return;
        // Find link index
        const linkIndex = changedRoutine.nodeLinks.findIndex(l => l.fromId === link.fromId && l.toId === link.toId);
        // Delete link
        const linksList = deleteArrayIndex(changedRoutine.nodeLinks, linkIndex);
        // Find "to" node. New node will be placed in its row and column
        const toNode = changedRoutine.nodes.find(n => n.id === link.toId);
        if (!toNode) {
            PubSub.get().publishSnack({ message: 'Error occurred.', severity: 'Error' });
            return;
        }
        const { columnIndex, rowIndex } = toNode;
        // Move every node starting from the "to" node to the right by one
        const nodesList = changedRoutine.nodes.map(n => {
            if (n.columnIndex !== null && n.columnIndex !== undefined && n.columnIndex >= (columnIndex ?? 0)) {
                return { ...n, columnIndex: n.columnIndex + 1 };
            }
            return n;
        });
        // Create new routine list node
        const newNode: Omit<NodeShape, 'routineId'> = createRoutineListNode(columnIndex, rowIndex);
        // Find every node 
        // Create two new links
        const newLinks: NodeLinkShape[] = [
            generateNewLink(link.fromId, newNode.id),
            generateNewLink(newNode.id, link.toId),
        ];
        // Insert new node and links
        const newRoutine = {
            ...changedRoutine,
            nodes: [...nodesList, newNode as any],
            nodeLinks: [...linksList, ...newLinks as any],
        };
        PubSub.get().publishFastUpdate({ duration: 1000 });
        setChangedRoutine(newRoutine);
    }, [changedRoutine, createRoutineListNode]);

    /**
     * Inserts a new routine list node, with its own branch
     */
    const handleBranchInsert = useCallback((link: NodeLink) => {
        if (!changedRoutine) return;
        // Find "to" node. New node will be placed in its column
        const toNode = changedRoutine.nodes.find(n => n.id === link.toId);
        if (!toNode) {
            PubSub.get().publishSnack({ message: 'Error occurred.', severity: 'Error' });
            return;
        }
        // Find the largest row index in the column. New node will be placed in the next row
        const maxRowIndex = changedRoutine.nodes.filter(n => n.columnIndex === toNode.columnIndex).map(n => n.rowIndex).reduce((a, b) => Math.max(a ?? 0, b ?? 0), 0);
        const newNode: Omit<NodeShape, 'routineId'> = createRoutineListNode(toNode.columnIndex, (maxRowIndex ?? toNode.rowIndex ?? 0) + 1);
        // Since this is a new branch, we also need to add an end node after the new node
        const newEndNode: Omit<NodeShape, 'routineId'> = createEndNode((toNode.columnIndex ?? 0) + 1, (maxRowIndex ?? toNode.rowIndex ?? 0) + 1);
        // Create new link, going from the "from" node to the new node
        const newLink: NodeLinkShape = generateNewLink(link.fromId, newNode.id);
        // Create new link, going from the new node to the end node
        const newEndLink: NodeLinkShape = generateNewLink(newNode.id, newEndNode.id);
        // Insert new nodes and links
        const newRoutine = {
            ...changedRoutine,
            nodes: [...changedRoutine.nodes, newNode as any, newEndNode as any],
            nodeLinks: [...changedRoutine.nodeLinks, newLink as any, newEndLink as any],
        };
        PubSub.get().publishFastUpdate({ duration: 1000 });
        setChangedRoutine(newRoutine);
    }, [changedRoutine, createEndNode, createRoutineListNode]);

    /**
     * Adds a subroutine routine list
     */
    const handleSubroutineAdd = useCallback((nodeId: string, routine: Routine) => {
        if (!changedRoutine) return;
        const nodeIndex = changedRoutine.nodes.findIndex(n => n.id === nodeId);
        if (nodeIndex === -1) return;
        const routineList: NodeDataRoutineList = changedRoutine.nodes[nodeIndex].data as NodeDataRoutineList;
        let routineItem: NodeDataRoutineListItem = {
            id: uuid(),
            index: routineList.routines.length,
            isOptional: true,
            routine,
        } as any
        if (routineList.isOrdered) routineItem.index = routineList.routines.length
        PubSub.get().publishFastUpdate({ duration: 1000 });
        setChangedRoutine({
            ...changedRoutine,
            nodes: updateArray(changedRoutine.nodes, nodeIndex, {
                ...changedRoutine.nodes[nodeIndex],
                data: {
                    ...routineList,
                    routines: [...routineList.routines, routineItem],
                }
            }),
        });
    }, [changedRoutine]);

    /**
     * Reoders a subroutine in a routine list item
     * @param nodeId The node id of the routine list item
     * @param oldIndex The old index of the subroutine
     * @param newIndex The new index of the subroutine
     */
    const handleSubroutineReorder = useCallback((nodeId: string, oldIndex: number, newIndex: number) => {
        // Find routines being swapped
        if (!changedRoutine) return;
        // Node containing routine list data with ID nodeId
        const nodeIndex = changedRoutine.nodes.findIndex(n => n.data?.id === nodeId);
        if (nodeIndex === -1) return;
        const routineList: NodeDataRoutineList = changedRoutine.nodes[nodeIndex].data as NodeDataRoutineList;
        const routines = [...routineList.routines];
        // Find subroutines matching old and new index
        const aIndex = routines.findIndex(r => r.index === oldIndex);
        const bIndex = routines.findIndex(r => r.index === newIndex);
        if (aIndex === -1 || bIndex === -1) return;
        // Swap the routine indexes
        routines[aIndex] = { ...routines[aIndex], index: newIndex };
        routines[bIndex] = { ...routines[bIndex], index: oldIndex };
        // Update the routine list
        setChangedRoutine({
            ...changedRoutine,
            nodes: updateArray(changedRoutine.nodes, nodeIndex, {
                ...changedRoutine.nodes[nodeIndex],
                data: {
                    ...routineList,
                    routines,
                }
            }),
        });
    }, [changedRoutine]);

    /**
     * Add a new end node AFTER a node
     */
    const handleAddEndAfter = useCallback((nodeId: string) => {
        if (!changedRoutine) return;
        // Find links where this node is the "from" node
        const links = changedRoutine.nodeLinks.filter(l => l.fromId === nodeId);
        // If multiple links, open a dialog to select which one to add after
        if (links.length > 1) {
            setAddAfterLinkNode(nodeId);
            return;
        }
        // If only one link, add after that link
        else if (links.length === 1) {
            const link = links[0];
            handleNodeInsert(link);
        }
        // If no links, create link and node
        else {
            const node = changedRoutine.nodes.find(n => n.id === nodeId);
            if (!node) return;
            const newNode: Omit<NodeShape, 'routineId'> = createEndNode((node.columnIndex ?? 1) + 1, (node.rowIndex ?? 0));
            const newLink: NodeLinkShape = generateNewLink(nodeId, newNode.id);
            setChangedRoutine({
                ...changedRoutine,
                nodes: [...changedRoutine.nodes, newNode as any],
                nodeLinks: [...changedRoutine.nodeLinks, newLink as any],
            });
        }
    }, [changedRoutine, createEndNode, handleNodeInsert]);

    /**
     * Add a new routine list AFTER a node
     */
    const handleAddListAfter = useCallback((nodeId: string) => {
        if (!changedRoutine) return;
        // Find links where this node is the "from" node
        const links = changedRoutine.nodeLinks.filter(l => l.fromId === nodeId);
        // If multiple links, open a dialog to select which one to add after
        if (links.length > 1) {
            setAddAfterLinkNode(nodeId);
            return;
        }
        // If only one link, add after that link
        else if (links.length === 1) {
            const link = links[0];
            handleNodeInsert(link);
        }
        // If no links, create link and node
        else {
            const node = changedRoutine.nodes.find(n => n.id === nodeId);
            if (!node) return;
            const newNode: Omit<NodeShape, 'routineId'> = createRoutineListNode((node.columnIndex ?? 1) + 1, (node.rowIndex ?? 0));
            const newLink: NodeLinkShape = generateNewLink(nodeId, newNode.id);
            setChangedRoutine({
                ...changedRoutine,
                nodes: [...changedRoutine.nodes, newNode as any],
                nodeLinks: [...changedRoutine.nodeLinks, newLink as any],
            });
        }
    }, [changedRoutine, createRoutineListNode, handleNodeInsert]);

    /**
     * Add a new routine list BEFORE a node
     */
    const handleAddListBefore = useCallback((nodeId: string) => {
        if (!changedRoutine) return;
        // Find links where this node is the "to" node
        const links = changedRoutine.nodeLinks.filter(l => l.toId === nodeId);
        // If multiple links, open a dialog to select which one to add before
        if (links.length > 1) {
            setAddBeforeLinkNode(nodeId);
            return;
        }
        // If only one link, add before that link
        else if (links.length === 1) {
            const link = links[0];
            handleNodeInsert(link);
        }
        // If no links, create link and node
        else {
            const node = changedRoutine.nodes.find(n => n.id === nodeId);
            if (!node) return;
            const newNode: Omit<NodeShape, 'routineId'> = createRoutineListNode((node.columnIndex ?? 1) - 1, (node.rowIndex ?? 0));
            const newLink: NodeLinkShape = generateNewLink(newNode.id, nodeId);
            setChangedRoutine({
                ...changedRoutine,
                nodes: [...changedRoutine.nodes, newNode as any],
                nodeLinks: [...changedRoutine.nodeLinks, newLink as any],
            });
        }
    }, [changedRoutine, createRoutineListNode, handleNodeInsert]);

    /**
     * Updates the current selected subroutine
     */
    const handleSubroutineUpdate = useCallback((updatedSubroutine: NodeDataRoutineListItem) => {
        if (!changedRoutine) return;
        // Update routine
        setChangedRoutine({
            ...changedRoutine,
            nodes: changedRoutine.nodes.map((n: Node) => {
                if (n.type === NodeType.RoutineList && (n.data as NodeDataRoutineList).routines.some(r => r.id === updatedSubroutine.id)) {
                    return {
                        ...n,
                        data: {
                            ...n.data,
                            routines: (n.data as NodeDataRoutineList).routines.map(r => {
                                if (r.id === updatedSubroutine.id) {
                                    return {
                                        ...r,
                                        ...updatedSubroutine,
                                        routine: {
                                            ...r.routine,
                                            ...updatedSubroutine.routine,
                                        }
                                    };
                                }
                                return r;
                            }),
                        },
                    };
                }
                return n;
            }),
        } as any);
        // Close dialog
        closeRoutineInfo();
    }, [changedRoutine, closeRoutineInfo]);

    /**
     * Navigates to a subroutine's build page. Fist checks if there are unsaved changes
     */
    const handleSubroutineViewFull = useCallback(() => {
        if (!openedSubroutine) return;
        if (!isEqual(routine, changedRoutine)) {
            PubSub.get().publishSnack({ message: 'You have unsaved changes. Please save or discard them before navigating to another routine.' });
            return;
        }
        // TODO - buildview should have its own buildview, to recursively open subroutines
        //setLocation(`${APP_LINKS.Build}/${selectedSubroutine.id}`);
    }, [changedRoutine, openedSubroutine, routine]);

    const handleAction = useCallback((action: BuildAction, nodeId: string, subroutineId?: string) => {
        const node = changedRoutine?.nodes?.find(n => n.id === nodeId);
        switch (action) {
            case BuildAction.AddIncomingLink:
                setLinkDialogTo(node ?? null);
                setIsLinkDialogOpen(true);
                break;
            case BuildAction.AddOutgoingLink:
                setLinkDialogFrom(node ?? null);
                setIsLinkDialogOpen(true);
                break;
            case BuildAction.AddSubroutine:
                setAddSubroutineNode(nodeId);
                break;
            case BuildAction.DeleteNode:
                handleNodeDelete(nodeId);
                break;
            case BuildAction.DeleteSubroutine:
                handleSubroutineDelete(nodeId, subroutineId ?? '');
                break;
            case BuildAction.EditSubroutine:
                handleSubroutineOpen(nodeId, subroutineId ?? '');
                break;
            case BuildAction.OpenSubroutine:
                handleSubroutineOpen(nodeId, subroutineId ?? '');
                break;
            case BuildAction.UnlinkNode:
                handleNodeDrop(nodeId, null, null);
                break;
            case BuildAction.AddEndAfterNode:
                handleAddEndAfter(nodeId);
                break;
            case BuildAction.AddListAfterNode:
                handleAddListAfter(nodeId);
                break;
            case BuildAction.AddListBeforeNode:
                handleAddListBefore(nodeId);
                break;
            case BuildAction.MoveNode:
                if (node) setMoveNode(node);
                break;
        }
    }, [changedRoutine?.nodes, handleNodeDelete, handleSubroutineDelete, handleSubroutineOpen, handleNodeDrop, handleAddEndAfter, handleAddListAfter, handleAddListBefore]);

    const handleRoutineAction = useCallback((action: BaseObjectAction, data: any) => {
        switch (action) {
            case BaseObjectAction.Copy:
                setLocation(`${APP_LINKS.Routine}/${data.copy.routine.id}`);
                break;
            case BaseObjectAction.Delete:
                setLocation(APP_LINKS.Home);
                break;
            case BaseObjectAction.Downvote:
                if (data.vote.success) {
                    onChange({
                        ...routine,
                        isUpvoted: false,
                    } as any)
                }
                break;
            case BaseObjectAction.Edit:
                //TODO
                break;
            case BaseObjectAction.Fork:
                setLocation(`${APP_LINKS.Routine}/${data.fork.routine.id}`);
                break;
            case BaseObjectAction.Report:
                //TODO
                break;
            case BaseObjectAction.Share:
                //TODO
                break;
            case BaseObjectAction.Star:
                if (data.star.success) {
                    onChange({
                        ...routine,
                        isStarred: true,
                    } as any)
                }
                break;
            case BaseObjectAction.Stats:
                //TODO
                break;
            case BaseObjectAction.Unstar:
                if (data.star.success) {
                    onChange({
                        ...routine,
                        isStarred: false,
                    } as any)
                }
                break;
            case BaseObjectAction.Update:
                updateRoutine();
                break;
            case BaseObjectAction.UpdateCancel:
                setChangedRoutine(routine);
                break;
            case BaseObjectAction.Upvote:
                if (data.vote.success) {
                    onChange({
                        ...routine,
                        isUpvoted: true,
                    } as any)
                }
                break;
        }
    }, [setLocation, updateRoutine, routine, onChange]);

    // Open/close unlinked nodes drawer
    const [isUnlinkedNodesOpen, setIsUnlinkedNodesOpen] = useState<boolean>(false);
    const toggleUnlinkedNodes = useCallback(() => setIsUnlinkedNodesOpen(curr => !curr), []);

    /**
     * Cleans up graph by removing empty columns and row gaps within columns.
     * Also adds end nodes to the end of each unfinished path. 
     * Also removes links that don't have both a valid fromId and toId.
     */
    const cleanUpGraph = useCallback(() => {
        if (!changedRoutine) return;
        const resultRoutine = JSON.parse(JSON.stringify(changedRoutine));
        // Loop through the columns, and remove gaps in rowIndex
        for (const column of columns) {
            // Sort nodes in column by rowIndex
            const sortedNodes = column.sort((a, b) => (a.rowIndex ?? 0) - (b.rowIndex ?? 0));
            // If the nodes don't go from 0 to n without any gaps
            if (sortedNodes.length > 0 && sortedNodes.some((n, i) => (n.rowIndex ?? 0) !== i)) {
                // Update nodes in resultRoutine with new rowIndexes
                const newNodes = sortedNodes.map((n, i) => ({
                    ...n,
                    rowIndex: i,
                }));
                // Replace nodes in resultRoutine
                resultRoutine.nodes = resultRoutine.nodes.map(oldNode => {
                    const newNode = newNodes.find(nn => nn.id === oldNode.id);
                    if (newNode) {
                        return newNode;
                    }
                    return oldNode;
                });
            }
        }
        // Find every node that does not have a link leaving it, which is also 
        // not an end node
        for (const node of resultRoutine.nodes) {
            // If not an end node
            if (node.type !== NodeType.End) {
                // Check if any links have a "fromId" matching this node's ID
                const leavingLinks = resultRoutine.nodeLinks.filter(link => link.fromId === node.id);
                // If there are no leaving links, create a new link and end node
                if (leavingLinks.length === 0) {
                    // Generate node ID
                    const newEndNodeId = uuid();
                    // Calculate rowIndex and columnIndex
                    // Column is 1 after current column
                    const columnIndex: number = (node.columnIndex ?? 0) + 1;
                    // Node is 1 after last rowIndex in column
                    const rowIndex = (columnIndex >= 0 && columnIndex < columns.length) ? columns[columnIndex].length : 0;
                    const newLink: NodeLinkShape = generateNewLink(node.id, newEndNodeId);
                    const newEndNode: Omit<NodeShape, 'routineId'> = {
                        __typename: 'Node',
                        id: newEndNodeId,
                        type: NodeType.End,
                        rowIndex,
                        columnIndex,
                        data: {
                            wasSuccessful: false,
                        } as any,
                        translations: [],
                    }
                    // Add link and end node to resultRoutine
                    resultRoutine.nodeLinks.push(newLink as any);
                    resultRoutine.nodes.push(newEndNode as any);
                }
            }
        }
        // Remove links that don't have both a valid fromId and toId
        resultRoutine.nodeLinks = resultRoutine.nodeLinks.filter(link => {
            const fromNode = resultRoutine.nodes.find(n => n.id === link.fromId);
            const toNode = resultRoutine.nodes.find(n => n.id === link.toId);
            return Boolean(fromNode && toNode);
        });
        // Increase link refresh rate while nodes are moving
        PubSub.get().publishFastUpdate({ duration: 1000 });
        // Update changedRoutine with resultRoutine
        setChangedRoutine(resultRoutine);
    }, [changedRoutine, columns]);

    return (
        <Box sx={{
            display: 'flex',
            flexDirection: 'column',
            minHeight: '100%',
            height: '100%',
            width: '100%',
        }}>
            {/* Popup for adding new subroutines */}
            {addSubroutineNode && <SubroutineSelectOrCreateDialog
                handleAdd={handleSubroutineAdd}
                handleClose={closeAddSubroutineDialog}
                isOpen={Boolean(addSubroutineNode)}
                nodeId={addSubroutineNode}
                routineId={routine?.id ?? ''}
                session={session}
                zIndex={zIndex + 3}
            />}
            {/* Popup for editing existing subroutines */}
            {/* TODO */}
            {/* Popup for "Add after" dialog */}
            {addAfterLinkNode && <AddAfterLinkDialog
                handleSelect={handleNodeInsert}
                handleClose={closeAddAfterLinkDialog}
                isOpen={Boolean(addAfterLinkNode)}
                nodes={changedRoutine?.nodes ?? []}
                links={changedRoutine?.nodeLinks ?? []}
                nodeId={addAfterLinkNode}
                session={session}
                zIndex={zIndex + 3}
            />}
            {/* Popup for "Add before" dialog */}
            {addBeforeLinkNode && <AddBeforeLinkDialog
                handleSelect={handleNodeInsert}
                handleClose={closeAddBeforeLinkDialog}
                isOpen={Boolean(addBeforeLinkNode)}
                nodes={changedRoutine?.nodes ?? []}
                links={changedRoutine?.nodeLinks ?? []}
                nodeId={addBeforeLinkNode}
                session={session}
                zIndex={zIndex + 3}
            />}
            {/* Popup for creating new links */}
            {changedRoutine ? <LinkDialog
                handleClose={handleLinkDialogClose}
                handleDelete={handleLinkDelete}
                isAdd={true}
                isOpen={isLinkDialogOpen}
                language={language}
                link={undefined}
                nodeFrom={linkDialogFrom}
                nodeTo={linkDialogTo}
                routine={changedRoutine}
                zIndex={zIndex + 3}
            // partial={ }
            /> : null}
            {/* Popup for moving nodes */}
            {moveNode && <MoveNodeDialog
                handleClose={closeMoveNodeDialog}
                isOpen={Boolean(moveNode)}
                language={language}
                node={moveNode}
                routine={changedRoutine}
                zIndex={zIndex + 3}
            />}
            {/* Displays routine information when you click on a routine list item*/}
            <SubroutineInfoDialog
                data={openedSubroutine}
                defaultLanguage={language}
                isEditing={isEditing}
                handleUpdate={handleSubroutineUpdate}
                handleReorder={handleSubroutineReorder}
                handleViewFull={handleSubroutineViewFull}
                open={Boolean(openedSubroutine)}
                session={session}
                onClose={closeRoutineInfo}
                zIndex={zIndex + 3}
            />
            {/* Display top navbars */}
            {/* First contains close icon and title */}
            <Stack
                id="routine-title-and-language"
                direction="row"
                sx={{
                    zIndex: 2,
                    background: palette.primary.dark,
                    color: palette.primary.contrastText,
                    height: '64px',
                }}>
                {/* Title */}
                <EditableLabel
                    canEdit={isEditing}
                    handleUpdate={updateRoutineTitle}
                    placeholder={loading ? 'Loading...' : 'Enter title...'}
                    renderLabel={(t) => (
                        <Typography
                            component="h2"
                            variant="h5"
                            textAlign="center"
                            sx={{
                                fontSize: { xs: '1em', sm: '1.25em', md: '1.5em' },
                            }}
                        >{t ?? (loading ? 'Loading...' : 'Enter title')}</Typography>
                    )}
                    text={getTranslation(changedRoutine, 'title', [language], false) ?? ''}
                    sxs={{
                        stack: { marginLeft: 'auto' }
                    }}
                />
                {/* Close Icon */}
                <IconButton
                    edge="start"
                    aria-label="close"
                    onClick={onClose}
                    color="inherit"
                    sx={{
                        marginLeft: 'auto',
                        marginRight: 1,
                        marginTop: 'auto',
                        marginBottom: 'auto',
                    }}
                >
                    <CloseIcon sx={{
                        width: '32px',
                        height: '32px',
                    }} />
                </IconButton>
            </Stack>
            {/* Second contains additional info and icons */}
            <Stack
                id="build-routine-information-bar"
                direction="row"
                spacing={2}
                width="100%"
                justifyContent="space-between"
                sx={{
                    zIndex: 2,
                    height: '48px',
                    background: palette.primary.light,
                    color: palette.primary.contrastText,
                }}
            >
                <StatusButton status={status.status} messages={status.messages} sx={{
                    marginTop: 'auto',
                    marginBottom: 'auto',
                    marginLeft: 2,
                }} />
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    {/* Clean up graph */}
                    {isEditing && <Tooltip title='Clean up graph'>
                        <IconButton
                            id="clean-graph-button"
                            edge="end"
                            onClick={cleanUpGraph}
                            aria-label='Clean up graph'
                            sx={{
                                background: '#ab9074',
                                marginLeft: 'auto',
                                marginRight: 1,
                                transition: 'brightness 0.2s ease-in-out',
                                '&:hover': {
                                    filter: `brightness(105%)`,
                                    background: '#ab9074',
                                },
                            }}
                        >
                            <CleanUpIcon id="clean-up-button-icon" sx={{ fill: 'white' }} />
                        </IconButton>
                    </Tooltip>}
                    {/* Add new links to the routine */}
                    {isEditing && <Tooltip title='Add new link'>
                        <IconButton
                            id="add-link-button"
                            edge="end"
                            onClick={openLinkDialog}
                            aria-label='Add link'
                            sx={{
                                background: '#9e3984',
                                marginRight: 1,
                                transition: 'brightness 0.2s ease-in-out',
                                '&:hover': {
                                    filter: `brightness(105%)`,
                                    background: '#9e3984',
                                },
                            }}
                        >
                            <AddLinkIcon id="add-link-button-icon" sx={{ fill: 'white' }} />
                        </IconButton>
                    </Tooltip>}
                    {/* Displays unlinked nodes */}
                    {isEditing && <UnlinkedNodesDialog
                        handleNodeDelete={handleNodeDelete}
                        handleToggleOpen={toggleUnlinkedNodes}
                        language={language}
                        nodes={nodesOffGraph}
                        open={isUnlinkedNodesOpen}
                        zIndex={zIndex + 3}
                    />}
                    {/* Edit button */}
                    {canEdit && !isEditing ? (
                        <IconButton aria-label="confirm-title-change" onClick={startEditing} >
                            <EditIcon sx={{ fill: TERTIARY_COLOR }} />
                        </IconButton>
                    ) : null}
                    {/* Help button */}
                    <HelpButton markdown={helpText} sxRoot={{ margin: "auto", marginRight: 1 }} sx={{ color: TERTIARY_COLOR }} />
                    {/* Display routine description, insturctions, etc. */}
                    <BuildInfoDialog
                        handleAction={handleRoutineAction}
                        handleLanguageChange={setLanguage}
                        handleUpdate={(updated: Routine) => { setChangedRoutine(updated); }}
                        isEditing={isEditing}
                        language={language}
                        loading={loading}
                        routine={changedRoutine}
                        session={session}
                        sxs={{ icon: { fill: TERTIARY_COLOR }, iconButton: { marginRight: 1 } }}
                        zIndex={zIndex + 1}
                    />
                </Box>
            </Stack>
            {/* Displays main routine's information and some buttons */}
            <Box sx={{
                background: palette.background.default,
                bottom: '0',
                display: 'flex',
                flexDirection: 'column',
                position: 'fixed',
                width: '100%',
            }}>
                <NodeGraph
                    columns={columns}
                    handleAction={handleAction}
                    handleBranchInsert={handleBranchInsert}
                    handleLinkCreate={handleLinkCreate}
                    handleLinkUpdate={handleLinkUpdate}
                    handleLinkDelete={handleLinkDelete}
                    handleNodeInsert={handleNodeInsert}
                    handleNodeUpdate={handleNodeUpdate}
                    handleNodeDrop={handleNodeDrop}
                    handleScaleChange={handleScaleDelta}
                    isEditing={isEditing}
                    labelVisible={true}
                    language={language}
                    links={changedRoutine?.nodeLinks ?? []}
                    nodesById={nodesById}
                    scale={scale}
                    zIndex={zIndex}
                />
                <BuildBottomContainer
                    canCancelMutate={!loading}
                    canSubmitMutate={!loading && !isEqual(routine, changedRoutine)}
                    handleCancelAdd={() => { window.history.back(); }}
                    handleCancelUpdate={revertChanges}
                    handleAdd={createRoutine}
                    handleUpdate={updateRoutine}
                    handleScaleChange={handleScaleChange}
                    handleRunDelete={handleRunDelete}
                    handleRunAdd={handleRunAdd}
                    hasNext={false}
                    hasPrevious={false}
                    isAdding={!uuidValidate(id)}
                    isEditing={isEditing}
                    loading={loading}
                    scale={scale}
                    session={session}
                    sliderColor={palette.secondary.light}
                    routine={routine}
                    runState={BuildRunState.Stopped}
                    zIndex={zIndex}
                />
            </Box>
        </Box>
    )
};