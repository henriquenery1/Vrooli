import { useMutation } from '@apollo/client';
import { reportCreate as validationSchema } from '@local/shared';
import { Autocomplete, Box, Button, Dialog, FormControl, Grid, IconButton, InputLabel, MenuItem, Select, Stack, TextField, Typography } from '@mui/material';
import { HelpButton } from 'components/buttons';
import { useFormik } from 'formik';
import { reportCreate } from 'graphql/generated/reportCreate';
import { reportCreateMutation } from 'graphql/mutation';
import { mutationWrapper } from 'graphql/utils/wrappers';
import { ReportDialogProps } from '../types';
import {
    Close as CloseIcon
} from '@mui/icons-material';
import { Pubs } from 'utils';

const helpText =
    `
# Header1 test
## Header2 test
**bold test**
fkdjslakfd;

fdsjlakfjdl;k
`

enum ReportOptions {
    Inappropriate = 'Inappropriate',
    PII = 'PII',
    Scam = 'Scam',
    Spam = 'Spam',
    Other = 'Other',
}

const ReportReasons = {
    [ReportOptions.Inappropriate]: 'Inappropriate Content',
    [ReportOptions.PII]: 'Includes Personally Identifiable Information (PII)',
    [ReportOptions.Scam]: 'Scam',
    [ReportOptions.Spam]: 'Spam',
    [ReportOptions.Other]: 'Other',
}

export const ReportDialog = ({
    open,
    onClose,
    title = 'Report',
    reportFor,
    forId,
}: ReportDialogProps) => {

    const [mutation, { loading }] = useMutation<reportCreate>(reportCreateMutation);
    const formik = useFormik({
        initialValues: {
            reason: '',
            otherReason: '',
            details: ''
        },
        validationSchema,
        onSubmit: (values) => {
            mutationWrapper({
                mutation,
                input: {
                    reason: values.otherReason.length > 0 ? values.otherReason : values.reason,
                    createdFor: reportFor,
                    createdForId: forId
                },
                successCondition: (response) => response.data.reportCreate !== null,
                onSuccess: (response) => {
                    PubSub.publish(Pubs.Snack, { message: 'Report submitted.' });
                    onClose()
                },
            })
        },
    });
    console.log('fdksafldafd reason', formik.values.reason)

    return (
        <Dialog
            onClose={onClose}
            open={open}
            sx={{
                '& .MuiDialog-paper': {
                    width: 'min(500px, 100vw)',
                    textAlign: 'center',
                    overflow: 'hidden',
                }
            }}
        >
            <form onSubmit={formik.handleSubmit}>
                <Box sx={{
                    padding: 1,
                    background: (t) => t.palette.primary.dark,
                    color: (t) => t.palette.primary.contrastText,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                }}>
                    <Typography component="h2" variant="h4" textAlign="center" sx={{ marginLeft: 'auto' }}>
                        {title}
                    </Typography>
                    <Box sx={{ marginLeft: 'auto' }}>
                        <HelpButton markdown={helpText} sx={{ fill: '#a0e7c4' }} />
                        <IconButton
                            edge="start"
                            onClick={onClose}
                        >
                            <CloseIcon sx={{ fill: (t) => t.palette.primary.contrastText }} />
                        </IconButton>
                    </Box>
                </Box>
                <Stack direction="column" spacing={2} sx={{ padding: 2 }}>
                    {/* Text displaying what you are reporting */}
                    <FormControl fullWidth>
                        <InputLabel id="report-reason-label">Reason</InputLabel>
                        <Select
                            labelId="report-reason-label"
                            id="reason"
                            value={formik.values.reason}
                            label="Reason"
                            onChange={(e) => formik.setFieldValue('reason', e.target.value)}
                        >
                            {Object.entries(ReportReasons).map(([key, value]) => (
                                <MenuItem key={key} value={key}>{value}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    {/* Textfield displayed if "Other" reason selected */}
                    {(formik.values.reason as any) === ReportOptions.Other ? <TextField
                        fullWidth
                        id="otherReason"
                        name="otherReason"
                        label="Custom Reason"
                        value={formik.values.otherReason}
                        onChange={formik.handleChange}
                        helperText="Enter custom reason..."
                    /> : null}
                    {/* Reason selector (with other option) */}
                    <TextField
                        fullWidth
                        id="details"
                        name="details"
                        label="Details (Optional)"
                        value={formik.values.details}
                        onChange={formik.handleChange}
                        helperText="Enter any details you'd like to share about this indcident. DO NOT include any personal information!"
                        rows={4}
                    />
                    {/* Details multi-line text field */}
                    {/* Action buttons */}
                    <Grid container sx={{ padding: 0 }}>
                        <Grid item xs={12} sm={6} sx={{ paddingRight: 1 }}>
                            <Button fullWidth type="submit">Submit</Button>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <Button fullWidth onClick={onClose} sx={{ paddingLeft: 1 }}>Cancel</Button>
                        </Grid>
                    </Grid>
                </Stack>
            </form>
        </Dialog>
    )
}