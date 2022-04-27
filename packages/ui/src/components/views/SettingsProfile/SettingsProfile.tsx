import { Autocomplete, Box, Container, Grid, IconButton, Stack, TextField, Typography } from "@mui/material"
import { useLazyQuery, useMutation } from "@apollo/client";
import { user } from "graphql/generated/user";
import { useCallback, useEffect, useMemo, useState } from "react";
import { mutationWrapper } from 'graphql/utils/wrappers';
import { APP_LINKS, profileUpdateSchema as validationSchema } from '@local/shared';
import { useFormik } from 'formik';
import { profileUpdateMutation } from "graphql/mutation";
import { formatForUpdate, getUserLanguages, Pubs } from "utils";
import {
    Refresh as RefreshIcon,
    Restore as CancelIcon,
    Save as SaveIcon,
} from '@mui/icons-material';
import { DialogActionItem } from "components/containers/types";
import { DialogActionsContainer } from "components/containers/DialogActionsContainer/DialogActionsContainer";
import { SettingsProfileProps } from "../types";
import { useLocation } from "wouter";
import { LanguageInput } from "components/inputs";
import { HelpButton } from "components/buttons";
import { findHandles, findHandlesVariables } from "graphql/generated/findHandles";
import { findHandlesQuery } from "graphql/query";

const helpText =
    `This page allows you to update your profile, including your name, handle, and bio.
    
Handles are unique, and handled (pun intended) by the [ADA Handle Protocol](https://adahandle.com/). This allows for handle to be 
used across many Cardano applications, and exchanged with others on an open market.

To use an ADA Handle, make sure it is in a wallet which is authenticated with your account.

If you set a handle, your Vrooli profile will be accessible via https://app.vrooli.com/profile/{handle}.

Your bio is displayed on your profile page. You may add multiple translations if you'd like.`;

const TERTIARY_COLOR = '#95f3cd';

export const SettingsProfile = ({
    onUpdated,
    profile,
    session,
}: SettingsProfileProps) => {
    const [, setLocation] = useLocation();

    // Query for handles associated with the user
    const [findHandles, { data: handlesData, loading: handlesLoading }] = useLazyQuery<findHandles, findHandlesVariables>(findHandlesQuery);
    const [handles, setHandles] = useState<string[]>([]);
    const fetchHandles = useCallback(() => {
        const verifiedWallets = profile?.wallets?.filter(w => w.verified) ?? [];
        if (verifiedWallets.length > 0) {
            findHandles({ variables: { input: {} } }); // Intentionally empty
        } else {
            PubSub.publish(Pubs.Snack, { message: 'No verified wallets associated with account', severity: 'error' })
        }
    }, [profile, findHandles]);
    useEffect(() => {
        if (handlesData?.findHandles) {
            setHandles(handlesData.findHandles);
        }
    }, [handlesData])

    const [selectedHandle, setSelectedHandle] = useState<string | null>(null);
    useEffect(() => {
        if (profile?.handle) {
            setSelectedHandle(profile.handle);
        }
    }, [profile]);

    // Handle translations
    type Translation = {
        language: string;
        bio: string;
    };
    const [translations, setTranslations] = useState<Translation[]>([]);
    const deleteTranslation = useCallback((language: string) => {
        setTranslations([...translations.filter(t => t.language !== language)]);
    }, [translations, setTranslations]);
    const getTranslationsUpdate = useCallback((language: string, translation: Translation) => {
        // Find translation
        const index = translations.findIndex(t => language === t.language);
        // If language exists, update
        if (index >= 0) {
            const newTranslations = [...translations];
            newTranslations[index] = { ...translation };
            return newTranslations;
        }
        // Otherwise, add new
        else {
            return [...translations, translation];
        }
    }, [translations]);
    const updateTranslation = useCallback((language: string, translation: Translation) => {
        setTranslations(getTranslationsUpdate(language, translation));
    }, [translations, setTranslations]);

    useEffect(() => {
        setTranslations(profile?.translations?.map(t => ({
            id: t.id,
            language: t.language,
            bio: t.bio ?? '',
        })) ?? [{ language: getUserLanguages(session)[0], bio: '' }]);
        formik.setValues({
            ...formik.values,
            name: profile?.name ?? '',
        })
    }, [profile, session]);

    // Handle update
    const [mutation] = useMutation<user>(profileUpdateMutation);
    const formik = useFormik({
        initialValues: {
            bio: '',
            name: '',
        },
        enableReinitialize: true, // Needed because existing data is obtained from async fetch
        validationSchema,
        onSubmit: (values) => {
            if (!formik.isValid) return;
            const allTranslations = getTranslationsUpdate(language, {
                language,
                bio: values.bio,
            })
            mutationWrapper({
                mutation,
                input: formatForUpdate(profile, {
                    name: values.name,
                    handle: selectedHandle,
                    translations: allTranslations,
                }, [], ['translations']),
                onSuccess: (response) => { onUpdated(response.data.profileUpdate); setLocation(APP_LINKS.Profile, { replace: true }) },
                onError: () => { formik.setSubmitting(false) },
            })
        },
    });

    // Handle languages
    const [language, setLanguage] = useState<string>('');
    const [languages, setLanguages] = useState<string[]>([]);
    useEffect(() => {
        if (languages.length === 0) {
            if (translations.length > 0) {
                setLanguage(translations[0].language);
                setLanguages(translations.map(t => t.language));
                formik.setValues({
                    ...formik.values,
                    bio: translations[0].bio,
                })
            } else {
                setLanguage(getUserLanguages(session)[0]);
                setLanguages([getUserLanguages(session)[0]]);
            }
        }
    }, [languages, setLanguage, setLanguages, translations])
    const handleLanguageChange = useCallback((oldLanguage: string, newLanguage: string) => {
        // Update translation
        updateTranslation(oldLanguage, {
            language: newLanguage,
            bio: formik.values.bio,
        });
        // Change selection
        setLanguage(newLanguage);
        // Update languages
        const newLanguages = [...languages];
        const index = newLanguages.findIndex(l => l === oldLanguage);
        if (index >= 0) {
            newLanguages[index] = newLanguage;
            setLanguages(newLanguages);
        }
    }, [formik.values, languages, translations, setLanguage, setLanguages, updateTranslation]);
    const updateFormikTranslation = useCallback((language: string) => {
        const existingTranslation = translations.find(t => t.language === language);
        formik.setValues({
            ...formik.values,
            bio: existingTranslation?.bio ?? '',
        });
    }, [formik.setValues, translations]);
    const handleLanguageSelect = useCallback((newLanguage: string) => {
        // Update old select
        updateTranslation(language, {
            language,
            bio: formik.values.bio,
        })
        // Update formik
        updateFormikTranslation(newLanguage);
        // Change language
        setLanguage(newLanguage);
    }, [formik.values, formik.setValues, language, translations, setLanguage, updateTranslation]);
    const handleAddLanguage = useCallback((newLanguage: string) => {
        setLanguages([...languages, newLanguage]);
        handleLanguageSelect(newLanguage);
    }, [handleLanguageSelect, languages, setLanguages]);
    const handleLanguageDelete = useCallback((language: string) => {
        const newLanguages = [...languages.filter(l => l !== language)]
        if (newLanguages.length === 0) return;
        deleteTranslation(language);
        updateFormikTranslation(newLanguages[0]);
        setLanguage(newLanguages[0]);
        setLanguages(newLanguages);
    }, [deleteTranslation, handleLanguageSelect, languages, setLanguages]);

    const actions: DialogActionItem[] = useMemo(() => [
        ['Save', SaveIcon, !formik.touched || formik.isSubmitting, true, () => { }],
        ['Cancel', CancelIcon, !formik.touched || formik.isSubmitting, false, () => { setLocation(APP_LINKS.Profile, { replace: true }) }],
    ], [formik, setLocation]);

    return (
        <form onSubmit={formik.handleSubmit} style={{ overflow: 'hidden' }}>
            {/* Title */}
            <Box sx={{
                background: (t) => t.palette.primary.dark,
                color: (t) => t.palette.primary.contrastText,
                padding: 0.5,
                marginBottom: 2,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
            }}>
                <Typography component="h1" variant="h4" textAlign="center">Update Profile</Typography>
                <HelpButton markdown={helpText} sx={{ fill: TERTIARY_COLOR }} />
            </Box>
            <Container sx={{ paddingBottom: 2 }}>
                <Grid container spacing={2}>
                    <Grid item xs={12}>
                        <LanguageInput
                            currentLanguage={language}
                            handleAdd={handleAddLanguage}
                            handleChange={handleLanguageChange}
                            handleDelete={handleLanguageDelete}
                            handleSelect={handleLanguageSelect}
                            languages={languages}
                            session={session}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <Stack direction="row" spacing={0}>
                            <Autocomplete
                                disablePortal
                                id="ada-handle-select"
                                loading={handlesLoading}
                                options={handles}
                                onOpen={fetchHandles}
                                onChange={(_, value) => { setSelectedHandle(value) }}
                                renderInput={(params) => <TextField {...params} label="(ADA) Handle" />}
                                value={selectedHandle}
                                sx={{
                                    width: '100%',
                                }}
                            />
                            <IconButton
                                aria-label='fetch-handles'
                                onClick={fetchHandles}
                                sx={{
                                    background: (t) => t.palette.secondary.main,
                                    borderRadius: '0 5px 5px 0',
                                }}>
                                <RefreshIcon />
                            </IconButton>
                        </Stack>
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            id="name"
                            name="name"
                            label="Name"
                            value={formik.values.name}
                            onBlur={formik.handleBlur}
                            onChange={formik.handleChange}
                            error={formik.touched.name && Boolean(formik.errors.name)}
                            helperText={formik.touched.name && formik.errors.name}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            id="bio"
                            name="bio"
                            label="Bio"
                            multiline
                            minRows={4}
                            value={formik.values.bio}
                            onBlur={formik.handleBlur}
                            onChange={formik.handleChange}
                            error={formik.touched.bio && Boolean(formik.errors.bio)}
                            helperText={formik.touched.bio && formik.errors.bio}
                        />
                    </Grid>
                </Grid>
            </Container>
            <DialogActionsContainer fixed={false} actions={actions} />
        </form>
    )
}