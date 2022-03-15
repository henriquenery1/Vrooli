import { Box, CircularProgress, Grid, TextField } from "@mui/material"
import { useRoute } from "wouter";
import { APP_LINKS } from "@local/shared";
import { useMutation, useQuery } from "@apollo/client";
import { standard } from "graphql/generated/standard";
import { standardQuery } from "graphql/query";
import { useCallback, useMemo, useState } from "react";
import { StandardUpdateProps } from "../types";
import { mutationWrapper } from 'graphql/utils/wrappers';
import PubSub from 'pubsub-js';
import { standardUpdate as validationSchema } from '@local/shared';
import { useFormik } from 'formik';
import { standardUpdateMutation } from "graphql/mutation";
import { formatForUpdate, Pubs } from "utils";
import {
    Restore as CancelIcon,
    Save as SaveIcon,
} from '@mui/icons-material';
import { TagSelector } from "components";
import { TagSelectorTag } from "components/inputs/types";
import { DialogActionItem } from "components/containers/types";
import { DialogActionsContainer } from "components/containers/DialogActionsContainer/DialogActionsContainer";

export const StandardUpdate = ({
    session,
    onUpdated,
    onCancel,
}: StandardUpdateProps) => {
    // Get URL params
    const [, params] = useRoute(`${APP_LINKS.Standard}/:id`);
    const [, params2] = useRoute(`${APP_LINKS.SearchStandards}/edit/:id`);
    const id: string = params?.id ?? params2?.id ?? '';
    // Fetch existing data
    const { data, loading } = useQuery<standard>(standardQuery, { variables: { input: { id } } });
    const standard = useMemo(() => data?.standard, [data]);

    // Handle tags
    const [tags, setTags] = useState<TagSelectorTag[]>([]);
    const addTag = useCallback((tag: TagSelectorTag) => {
        setTags(t => [...t, tag]);
    }, [setTags]);
    const removeTag = useCallback((tag: TagSelectorTag) => {
        console.log('removeTag', tag);
        const temp = tags.filter(t => t.tag !== tag.tag);
        console.log('temp', tags.length, temp.length);
        setTags(tags => tags.filter(t => t.tag !== tag.tag));
    }, [setTags]);
    const clearTags = useCallback(() => {
        setTags([]);
    }, [setTags]);

    // Handle update
    const [mutation] = useMutation<standard>(standardUpdateMutation);
    const formik = useFormik({
        initialValues: {
            description: '',
        },
        enableReinitialize: true, // Needed because existing data is obtained from async fetch
        validationSchema,
        onSubmit: (values) => {
            mutationWrapper({
                mutation,
                input: formatForUpdate(standard, { id, ...values }),
                onSuccess: (response) => { onUpdated(response.data.standardUpdate) },
                onError: (response) => {
                    PubSub.publish(Pubs.Snack, { message: 'Error occurred.', severity: 'error', data: { error: response } });
                }
            })
        },
    });

    const actions: DialogActionItem[] = useMemo(() => [
        ['Save', SaveIcon, Boolean(formik.isSubmitting || !formik.isValid), true, () => { }],
        ['Cancel', CancelIcon, formik.isSubmitting, false, onCancel],
    ], [formik, onCancel, session]);
    const [formBottom, setFormBottom] = useState<number>(0);
    const handleResize = useCallback(({ height }: any) => {
        setFormBottom(height);
    }, [setFormBottom]);

    const formInput = useMemo(() => (
        <Grid container spacing={2} sx={{ padding: 2 }}>
            {/* TODO */}
            <Grid item xs={12} marginBottom={4}>
                <TagSelector
                    session={session}
                    tags={tags}
                    onTagAdd={addTag}
                    onTagRemove={removeTag}
                    onTagsClear={clearTags}
                />
            </Grid>
        </Grid>
    ), [formik, actions, handleResize, formBottom, session, tags, addTag, removeTag, clearTags]);


    return (
        <form onSubmit={formik.handleSubmit} style={{ paddingBottom: `${formBottom}px` }}>
            {loading ? (
                <Box sx={{
                    position: 'absolute',
                    top: '-5vh', // Half of toolbar height
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                }}>
                    <CircularProgress size={100} color="secondary" />
                </Box>
            ) : formInput}
            <DialogActionsContainer actions={actions} onResize={handleResize} />
        </form>
    )
}