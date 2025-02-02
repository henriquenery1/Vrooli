import { Grid, Stack, Theme } from '@mui/material';
import { FieldData, GridContainer, GridContainerBase, GridItemSpacing } from 'forms/types';
import { Session } from 'types';
import { generateInputComponent } from '.';

/**
 * Wraps a component in a Grid item
 * @param component The component to wrap
 * @param sizes The sizes of the grid item
 * @param index The index of the grid
 * @returns Grid item component
 */
export const generateGridItem = (component: React.ReactElement, sizes: GridItemSpacing | undefined, index: number): React.ReactElement => (
    <Grid item key={`grid-${index}`} spacing={sizes as any}>
        {component}
    </Grid>
);

/**
 * Calculates size of grid item based on the number of items in the grid. 
 * 1 item is { xs: 12 }, 
 * 2 items is { xs: 12, sm: 6 },
 * 3 items is { xs: 12, sm: 6, md: 4 },
 * 4+ items is { xs: 12, sm: 6, md: 4, lg: 3 }
 * @returns Size of grid item
 */
export const calculateGridItemSize = (numItems: number): GridItemSpacing => {
    switch (numItems) {
        case 1:
            return { xs: 12 };
        case 2:
            return { xs: 12, sm: 6 };
        case 3:
            return { xs: 12, sm: 6, md: 4 };
        default:
            return { xs: 12, sm: 6, md: 4, lg: 3 };
    }
}

interface GenerateGridProps {
    childContainers?: GridContainer[];
    fields: FieldData[];
    formik: any;
    layout?: GridContainer | GridContainerBase;
    onUpload: (fieldName: string, files: string[]) => void;
    session: Session;
    theme: Theme;
    zIndex: number;
}
/**
 * Wraps a list of Grid items in a Grid container
 * @returns Grid component
 */
export const generateGrid = ({
    childContainers,
    fields,
    formik,
    layout,
    onUpload,
    session,
    theme,
    zIndex,
}: GenerateGridProps): JSX.Element => {
    // Split fields into which containers they belong to.
    // Represented by 2D array, where each sub-array represents a container.
    let splitFields: FieldData[][] = [];
    let containers: GridContainer[];
    if (!childContainers) {
        splitFields = [fields];
        containers = [{
            ...layout,
            title: undefined,
            description: undefined,
            totalItems: fields.length,
            showBorder: false,
        }]
    }
    else {
        let lastField = 0;
        for (let i = 0; i < childContainers.length; i++) {
            const numInContainer = childContainers[i].totalItems;
            splitFields.push(fields.slice(lastField, lastField + numInContainer));
            lastField += numInContainer;
        }
        containers = childContainers;
    }
    // Generate grid for each container
    let grids: React.ReactElement[] = [];
    for (let i = 0; i < splitFields.length; i++) {
        const currFields: FieldData[] = splitFields[i];
        const currLayout: GridContainer = containers[i];
        // Generate component for each field in the grid, and wrap it in a grid item
        const gridItems: Array<React.ReactElement | null> = currFields.map((fieldData, index) => {
            const inputComponent = generateInputComponent({
                formik,
                fieldData,
                index,
                onUpload,
                session,
                zIndex,
            });
            return inputComponent ? generateGridItem(inputComponent, currLayout?.itemSpacing ?? calculateGridItemSize(currFields.length), index) : null;
        });
        grids.push(
            <fieldset
                key={`grid-container-${i}`}
                style={{
                    borderRadius: '8px',
                    border: currLayout?.showBorder ? `1px solid ${theme.palette.background.textPrimary}` : 'none',
                }}
            >
                {currLayout?.title && <legend >{currLayout?.title}</legend>}
                <Grid
                    container
                    direction={currLayout?.direction ?? 'row'}
                    key={`form-container-${i}`}
                    spacing={currLayout?.spacing}
                    columnSpacing={currLayout?.columnSpacing}
                    rowSpacing={currLayout?.rowSpacing}
                >
                    {gridItems}
                </Grid>
            </fieldset>
        )
    }
    return (
        <Stack
            direction={layout?.direction ?? 'row'}
            key={`form-container`}
            spacing={layout?.spacing}
        >
            {grids}
        </Stack>
    )
};