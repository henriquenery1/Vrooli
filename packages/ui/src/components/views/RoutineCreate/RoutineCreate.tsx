import { Grid, TextField } from "@mui/material";
import { useMutation } from "@apollo/client";
import { routine } from "graphql/generated/routine";
import { mutationWrapper } from 'graphql/utils/wrappers';
import { ROLES, routineCreateForm as validationSchema } from '@local/shared';
import { useFormik } from 'formik';
import { routineCreateMutation } from "graphql/mutation";
import { formatForCreate, getUserLanguages } from "utils";
import { RoutineCreateProps } from "../types";
import { useCallback, useEffect, useMemo, useState } from "react";
import { DialogActionItem } from "components/containers/types";
import {
    Add as CreateIcon,
    Restore as CancelIcon,
} from '@mui/icons-material';
import { TagSelectorTag } from "components/inputs/types";
import { LanguageInput, MarkdownInput, ResourceListHorizontal, TagSelector } from "components";
import { DialogActionsContainer } from "components/containers/DialogActionsContainer/DialogActionsContainer";
import { ResourceList, RoutineInputList, RoutineOutputList } from "types";
import { ResourceListUsedFor } from "graphql/generated/globalTypes";
import { v4 as uuidv4 } from 'uuid';
import { InputOutputContainer } from "components/lists/inputOutput";

export const RoutineCreate = ({
    onCreated,
    onCancel,
    session,
}: RoutineCreateProps) => {

    // Hanlde inputs
    const [inputsList, setInputsList] = useState<RoutineInputList>([]);
    const handleInputsUpdate = useCallback((updatedList: RoutineInputList) => {
        setInputsList(updatedList);
    }, [setInputsList]);

    // Handle outputs
    const [outputsList, setOutputsList] = useState<RoutineOutputList>([]);
    const handleOutputsUpdate = useCallback((updatedList: RoutineOutputList) => {
        setOutputsList(updatedList);
    }, [setOutputsList]);

    // Handle resources
    const [resourceList, setResourceList] = useState<ResourceList>({ id: uuidv4(), usedFor: ResourceListUsedFor.Display } as any);
    const handleResourcesUpdate = useCallback((updatedList: ResourceList) => {
        setResourceList(updatedList);
    }, [setResourceList]);

    // Handle tags
    const [tags, setTags] = useState<TagSelectorTag[]>([]);
    const addTag = useCallback((tag: TagSelectorTag) => {
        setTags(t => [...t, tag]);
    }, [setTags]);
    const removeTag = useCallback((tag: TagSelectorTag) => {
        setTags(tags => tags.filter(t => t.tag !== tag.tag));
    }, [setTags]);
    const clearTags = useCallback(() => {
        setTags([]);
    }, [setTags]);

    // Handle translations
    type Translation = {
        language: string;
        description: string;
        instructions: string;
        title: string;
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

    // Handle create
    const [mutation] = useMutation<routine>(routineCreateMutation);
    const formik = useFormik({
        initialValues: {
            description: '',
            instructions: '',
            title: '',
            version: ''
        },
        validationSchema,
        onSubmit: (values) => {
            const inputsAdd = inputsList ? formatForCreate(inputsList) : [];
            const outputsAdd = outputsList ? formatForCreate(outputsList) : [];
            const resourceListAdd = resourceList ? formatForCreate(resourceList) : {};
            const tagsAdd = tags.length > 0 ? {
                tagsCreate: tags.filter(t => !t.id).map(t => ({ tag: t.tag })),
                tagsConnect: tags.filter(t => t.id).map(t => (t.id)),
            } : {};
            const allTranslations = getTranslationsUpdate(language, {
                language,
                description: values.description,
                instructions: values.instructions,
                title: values.title,
            })
            console.log('ON SUBMIT INPUT', inputsAdd)
            console.log('ON SUBMIT OUTPUT', outputsAdd)
            mutationWrapper({
                mutation,
                input: formatForCreate({
                    translations: allTranslations,
                    ...inputsAdd,
                    ...outputsAdd,
                    resourceListsCreate: [resourceListAdd],
                    ...tagsAdd,
                    version: values.version,
                }) as any,
                onSuccess: (response) => { onCreated(response.data.routineCreate) },
                onError: () => { formik.setSubmitting(false) }
            })
        },
    });

    // Handle languages
    const [language, setLanguage] = useState<string>(getUserLanguages(session)[0]);
    const [languages, setLanguages] = useState<string[]>([getUserLanguages(session)[0]]);
    useEffect(() => {
        if (languages.length === 0) {
            const userLanguage = getUserLanguages(session)[0]
            setLanguage(userLanguage)
            setLanguages([userLanguage])
        }
    }, [languages, session, setLanguage, setLanguages])
    const handleLanguageChange = useCallback((oldLanguage: string, newLanguage: string) => {
        // Update translation
        updateTranslation(oldLanguage, {
            language: newLanguage,
            description: formik.values.description,
            instructions: formik.values.instructions,
            title: formik.values.title,
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
            description: existingTranslation?.description ?? '',
            instructions: existingTranslation?.instructions ?? '',
            title: existingTranslation?.title ?? '',
        });
    }, [formik.setValues, translations]);
    const handleLanguageSelect = useCallback((newLanguage: string) => {
        // Update old select
        updateTranslation(language, {
            language,
            description: formik.values.description,
            instructions: formik.values.instructions,
            title: formik.values.title,
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

    const actions: DialogActionItem[] = useMemo(() => {
        const correctRole = Array.isArray(session?.roles) && session.roles.includes(ROLES.Actor);
        return [
            ['Create', CreateIcon, Boolean(!correctRole || formik.isSubmitting), true, () => { }],
            ['Cancel', CancelIcon, formik.isSubmitting, false, onCancel],
        ] as DialogActionItem[]
    }, [formik, onCancel, session]);
    const [formBottom, setFormBottom] = useState<number>(0);
    const handleResize = useCallback(({ height }: any) => {
        setFormBottom(height);
    }, [setFormBottom]);

    return (
        <form onSubmit={formik.handleSubmit} style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            paddingBottom: `${formBottom}px`,
        }}
        >
            <Grid container spacing={2} sx={{ padding: 2, maxWidth: 'min(700px, 100%)' }}>
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
                    <TextField
                        fullWidth
                        id="title"
                        name="title"
                        label="title"
                        value={formik.values.title}
                        onBlur={formik.handleBlur}
                        onChange={formik.handleChange}
                        error={formik.touched.title && Boolean(formik.errors.title)}
                        helperText={formik.touched.title && formik.errors.title}
                    />
                </Grid>
                <Grid item xs={12}>
                    <TextField
                        fullWidth
                        id="description"
                        name="description"
                        label="description"
                        value={formik.values.description}
                        rows={3}
                        onBlur={formik.handleBlur}
                        onChange={formik.handleChange}
                        error={formik.touched.description && Boolean(formik.errors.description)}
                        helperText={formik.touched.description && formik.errors.description}
                    />
                </Grid>
                <Grid item xs={12}>
                    <MarkdownInput
                        id="instructions"
                        placeholder="Instructions"
                        value={formik.values.instructions}
                        minRows={4}
                        onChange={(newText: string) => formik.setFieldValue('instructions', newText)}
                        error={formik.touched.instructions && Boolean(formik.errors.instructions)}
                        helperText={formik.touched.instructions ? formik.errors.instructions : null}
                    />
                </Grid>
                <Grid item xs={12}>
                    <InputOutputContainer
                        isEditing={true}
                        handleUpdate={handleInputsUpdate as (updatedList: RoutineInputList | RoutineOutputList) => void}
                        isInput={true}
                        list={inputsList}
                        session={session}
                    />
                </Grid>
                <Grid item xs={12}>
                    <InputOutputContainer
                        isEditing={true}
                        handleUpdate={handleOutputsUpdate as (updatedList: RoutineInputList | RoutineOutputList) => void}
                        isInput={false}
                        list={outputsList}
                        session={session}
                    />
                </Grid>
                <Grid item xs={12}>
                    <ResourceListHorizontal
                        title={'Resources'}
                        list={resourceList}
                        canEdit={true}
                        handleUpdate={handleResourcesUpdate}
                        session={session}
                        mutate={false}
                    />
                </Grid>
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
            <DialogActionsContainer actions={actions} onResize={handleResize} />
        </form>
    )
}