import { Box, Button, CircularProgress, IconButton, ListItem, ListItemText, Stack, Tooltip, useTheme } from '@mui/material';
import { CommentListItemProps } from '../types';
import { useCallback, useMemo, useState } from 'react';
import { useLocation } from 'wouter';
import { StarButton, TextLoading, UpvoteDownvote } from '../..';
import { displayDate, getCreatedByString, getTranslation, ObjectType, Pubs, toCreatedBy } from 'utils';
import { LinkButton, MarkdownInput } from 'components/inputs';
import {
    Delete as DeleteIcon,
    Flag as ReportIcon,
    Reply as ReplyIcon,
    Share as ShareIcon,
} from '@mui/icons-material';
import { useMutation } from '@apollo/client';
import { mutationWrapper } from 'graphql/utils';
import { ReportFor, StarFor, VoteFor } from '@local/shared';
import { commentCreateForm as validationSchema } from '@local/shared';
import { commentCreate } from 'graphql/generated/commentCreate';
import { commentCreateMutation, deleteOneMutation } from 'graphql/mutation';
import { useFormik } from 'formik';
import { owns } from 'utils/authentication';
import { deleteOne } from 'graphql/generated/deleteOne';
import { ReportDialog } from 'components/dialogs';

export function CommentListItem({
    data,
    handleCommentAdd,
    handleCommentRemove,
    isOpen,
    language,
    loading,
    objectId,
    objectType,
    session,
    zIndex,
}: CommentListItemProps) {
    const { palette } = useTheme();
    const [, setLocation] = useLocation();
    const { text } = useMemo(() => {
        const languages = session?.languages ?? navigator.languages;
        return {
            text: getTranslation(data, 'text', languages, true),
        };
    }, [data, session]);

    const ownedBy = useMemo<string | null>(() => getCreatedByString(data, session?.languages ?? navigator.languages), [data, session?.languages]);
    const toOwner = useCallback(() => { toCreatedBy(data, setLocation) }, [data, setLocation]);

    const [replyOpen, setReplyOpen] = useState(false);
    const [addMutation, { loading: loadingAdd }] = useMutation<commentCreate>(commentCreateMutation);
    const formik = useFormik({
        initialValues: {
            comment: '',
        },
        validationSchema,
        onSubmit: (values) => {
            if (!data) return;
            mutationWrapper({
                mutation: addMutation,
                input: {
                    createdFor: objectType,
                    forId: objectId,
                    parentId: data.id,
                    translationsCreate: [{
                        language,
                        text: values.comment,
                    }]
                },
                successCondition: (response) => response.data.commentCreate !== null,
                onSuccess: (response) => {
                    PubSub.publish(Pubs.Snack, { message: 'Comment created.', severity: 'success' });
                    formik.resetForm();
                    setReplyOpen(false);
                    handleCommentAdd(response.data.commentCreate);
                },
                onError: () => { formik.setSubmitting(false) },
            })
        },
    });
    const openReplyInput = useCallback(() => { setReplyOpen(true) }, []);
    const closeReplyInput = useCallback(() => {
        formik.resetForm();
        setReplyOpen(false)
    }, [formik]);

    /**
     * Handle add comment click
     */
    const handleReplySubmit = useCallback((event: any) => {
        // Make sure submit does not propagate past the form
        event.preventDefault();
        // Make sure form is valid
        if (!formik.isValid) return;
        // Submit form
        formik.submitForm();
    }, [formik]);

    const handleShare = useCallback(() => {
        //TODO
    }, []);

    const [reportOpen, setReportOpen] = useState<boolean>(false);
    const openReport = useCallback(() => setReportOpen(true), [setReportOpen]);
    const closeReport = useCallback(() => setReportOpen(false), [setReportOpen]);

    const [deleteMutation, { loading: loadingDelete }] = useMutation<deleteOne>(deleteOneMutation);
    const handleDelete = useCallback(() => {
        if (!data) return;
        // Confirmation dialog
        PubSub.publish(Pubs.AlertDialog, {
            message: `Are you sure you want to delete this comment? This action cannot be undone.`,
            buttons: [
                {
                    text: 'Yes', onClick: () => {
                        mutationWrapper({
                            mutation: deleteMutation,
                            input: { id: data.id, objectType: ObjectType.Comment },
                            onSuccess: (response) => {
                                if (response?.data?.deleteOne?.success) {
                                    PubSub.publish(Pubs.Snack, { message: `Comment deleted.` });
                                    handleCommentRemove(data);
                                } else {
                                    PubSub.publish(Pubs.Snack, { message: `Error deleting comment.`, severity: 'error' });
                                }
                            },
                            onError: () => {
                                PubSub.publish(Pubs.Snack, { message: `Failed to delete comment.` });
                            }
                        })
                    }
                },
                { text: 'Cancel', onClick: () => { } },
            ]
        });
    }, [data, deleteMutation, handleCommentRemove]);

    return (
        <>
            <ReportDialog
                forId={data?.id ?? ''}
                onClose={closeReport}
                open={reportOpen}
                reportFor={ReportFor.Comment}
                session={session}
                zIndex={zIndex + 1}
            />
            <ListItem
                id={`comment-${data?.id}`}
                disablePadding
                sx={{
                    display: 'flex',
                    background: 'transparent',
                }}
            >
                <Stack
                    direction="column"
                    spacing={1}
                    pl={2}
                    sx={{
                        width: '-webkit-fill-available',
                        display: 'grid',
                    }}
                >
                    {/* Username and time posted */}
                    <Stack direction="row" spacing={1}>
                        {/* Username and role */}
                        {
                            ownedBy && (
                                <Stack direction="row" spacing={1} sx={{
                                    overflow: 'auto',
                                }}>
                                    <LinkButton
                                        onClick={toOwner}
                                        text={ownedBy}
                                        sxs={{
                                            text: {
                                                color: palette.background.textPrimary,
                                                fontWeight: 'bold',
                                            }
                                        }}
                                    />
                                    {data?.role && !(data?.creator?.id && data.creator.id === session?.id) && <ListItemText
                                        primary={`(${data.role})`}
                                        sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            color: '#f2a7a7',
                                        }}
                                    />}
                                    {data?.creator?.id && data.creator.id === session?.id && <ListItemText
                                        primary={`(You)`}
                                        sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            color: '#f2a7a7',
                                        }}
                                    />}
                                </Stack>
                            )
                        }
                        {/* Time posted */}
                        <ListItemText
                            primary={displayDate(data?.created_at, false)}
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                            }}
                        />
                    </Stack>
                    {/* Text */}
                    {isOpen && (loading ? <TextLoading /> : <ListItemText
                        primary={text}
                    />)}
                    {/* Text buttons for reply, share, report, star, delete. */}
                    {isOpen && <Stack direction="row" spacing={1}>
                        <UpvoteDownvote
                            direction="row"
                            session={session}
                            objectId={data?.id ?? ''}
                            voteFor={VoteFor.Comment}
                            isUpvoted={data?.isUpvoted}
                            score={data?.score}
                            onChange={() => { }}
                        />
                        <StarButton
                            session={session}
                            objectId={data?.id ?? ''}
                            starFor={StarFor.Comment}
                            isStar={data?.isStarred ?? false}
                            showStars={false}
                            tooltipPlacement="top"
                        />
                        <Tooltip title="Reply" placement='top'>
                            <IconButton
                                onClick={openReplyInput}
                                sx={{
                                    color: palette.background.textPrimary,
                                }}
                            >
                                <ReplyIcon />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="Share" placement='top'>
                            <IconButton
                                onClick={handleShare}
                                sx={{
                                    color: palette.background.textPrimary,
                                }}
                            >
                                <ShareIcon />
                            </IconButton>
                        </Tooltip>
                        {!owns(data?.role) && <Tooltip title="Report" placement='top'>
                            <IconButton
                                onClick={openReport}
                                sx={{
                                    color: palette.background.textPrimary,
                                }}
                            >
                                <ReportIcon />
                            </IconButton>
                        </Tooltip>}
                        {owns(data?.role) && <Tooltip title="Delete" placement='top'>
                            <IconButton
                                onClick={handleDelete}
                                disabled={loadingDelete}
                                sx={{
                                    color: palette.background.textPrimary,
                                }}
                            >
                                <DeleteIcon />
                            </IconButton>
                        </Tooltip>}
                    </Stack>}
                    {/* New reply input */}
                    {replyOpen && (
                        <form>
                            <Box sx={{ margin: 2 }}>
                                <MarkdownInput
                                    id={`add-reply-${data?.id}`}
                                    placeholder="Please be nice to each other."
                                    value={formik.values.comment}
                                    minRows={3}
                                    onChange={(newText: string) => formik.setFieldValue('comment', newText)}
                                    error={formik.touched.comment && Boolean(formik.errors.comment)}
                                    helperText={formik.touched.comment ? formik.errors.comment as string : null}
                                />
                                <Stack direction="row" sx={{
                                    paddingTop: 1,
                                    display: 'flex',
                                    flexDirection: 'row-reverse',
                                }}>
                                    <Tooltip title={formik.errors.comment ? formik.errors.comment as string : ''}>
                                        <Button
                                            color="secondary"
                                            disabled={loadingAdd || formik.isSubmitting || !formik.isValid}
                                            onClick={handleReplySubmit}
                                            sx={{ marginLeft: 1 }}
                                        >
                                            {loadingAdd ? <CircularProgress size={24} /> : 'Add'}
                                        </Button>
                                    </Tooltip>
                                    <Button
                                        color="secondary"
                                        disabled={loadingAdd || formik.isSubmitting}
                                        onClick={closeReplyInput}
                                    >
                                        Cancel
                                    </Button>
                                </Stack>
                            </Box>
                        </form>
                    )}
                </Stack>
            </ListItem>
        </>
    )
}