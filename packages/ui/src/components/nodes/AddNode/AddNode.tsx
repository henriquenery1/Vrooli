import { makeStyles } from '@mui/styles';
import { IconButton, Theme, Tooltip } from '@mui/material';
import { useMemo, useState } from 'react';
import { AddNodeProps } from '../types';
import { nodeStyles } from '../styles';
import { combineStyles } from 'utils';
import { ListDialog } from 'components';
import { 
    Add as AddIcon,
    AltRoute as DecisionIcon,
    Done as EndIcon,
    List as RoutineListIcon,
    Loop as LoopIcon,
    MergeType as CombineIcon,
    SvgIconComponent,
    UTurnLeft as RedirectIcon
} from '@mui/icons-material';
import { NodeType } from '@local/shared';

const componentStyles = (theme: Theme) => ({
    root: {
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        padding: '0',
        backgroundColor: '#6daf72',
        color: 'white',
        borderRadius: '100%',
        boxShadow: '0px 0px 12px gray',
        '&:hover': {
            backgroundColor: '#6daf72',
            filter: `brightness(120%)`,
            transition: 'filter 0.2s',
        },
    },
    icon: {
        width: '80%',
        height: '80%',
    }
});

const useStyles = makeStyles(combineStyles(nodeStyles, componentStyles));

const optionsMap: {[x: string]: [string, SvgIconComponent]} = {
    [NodeType.Combine]: ['Combine', CombineIcon],
    [NodeType.Decision]: ['Decision', DecisionIcon],
    [NodeType.End]: ['End', EndIcon],
    [NodeType.Loop]: ['Loop', LoopIcon],
    [NodeType.RoutineList]: ['Routine List', RoutineListIcon],
    [NodeType.Redirect]: ['Redirect', RedirectIcon],
}

export const AddNode = ({
    scale = 1,
    options = Object.values(NodeType).filter(o => o !== NodeType.Start),
    onAdd,
}: AddNodeProps) => {
    const classes = useStyles();
    const [dialogOpen, setDialogOpen] = useState(false);
    const openDialog = () => setDialogOpen(true);
    const closeDialog = () => setDialogOpen(false);
    const listOptions = useMemo(() => options.map(o => ({ 
        label: optionsMap[o][0],
        value: o,
        Icon: optionsMap[o][1]
    })), [options]);
    const dialog = useMemo(() => dialogOpen ? (
        <ListDialog
            title='Add Step'
            data={listOptions}
            onSelect={onAdd}
            onClose={closeDialog} />
    ) : null, [dialogOpen, listOptions, onAdd])

    const nodeSize = useMemo(() => `${100 * scale}px`, [scale]);

    return (
        <div>
            {dialog}
            <Tooltip placement={'top'} title='Insert step'>
                <IconButton className={classes.root} style={{width: nodeSize, height: nodeSize}} onClick={openDialog}>
                    <AddIcon className={classes.icon} />
                </IconButton>
            </Tooltip>
        </div>
    )
}