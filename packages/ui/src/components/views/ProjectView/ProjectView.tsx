import { Box, IconButton, LinearProgress, Link, Stack, Tab, Tabs, Tooltip, Typography, useTheme } from "@mui/material"
import { useLocation, useRoute } from "wouter";
import { adaHandleRegex, APP_LINKS, ResourceListUsedFor, StarFor } from "@local/shared";
import { useLazyQuery } from "@apollo/client";
import { project, projectVariables } from "graphql/generated/project";
import { routinesQuery, standardsQuery, projectQuery } from "graphql/query";
import { MouseEvent, useCallback, useEffect, useMemo, useState } from "react";
import {
    CardGiftcard as DonateIcon,
    Edit as EditIcon,
    MoreHoriz as EllipsisIcon,
    Share as ShareIcon,
    Today as CalendarIcon,
} from "@mui/icons-material";
import { BaseObjectActionDialog, ResourceListVertical, SearchList, SelectLanguageDialog, StarButton } from "components";
import { containerShadow } from "styles";
import { ProjectViewProps } from "../types";
import { Project, ResourceList } from "types";
import { SearchListGenerator } from "components/lists/types";
import { displayDate, getLanguageSubtag, getPreferredLanguage, getTranslation, getUserLanguages, ObjectType, PubSub } from "utils";
import { validate as uuidValidate } from 'uuid';

enum TabOptions {
    Resources = "Resources",
    Routines = "Routines",
    Standards = "Standards",
}

export const ProjectView = ({
    partialData,
    session,
    zIndex,
}: ProjectViewProps) => {
    const { palette } = useTheme();
    const [, setLocation] = useLocation();
    // Get URL params
    const [, params] = useRoute(`${APP_LINKS.Project}/:id`);
    const [, params2] = useRoute(`${APP_LINKS.SearchProjects}/view/:id`);
    const id: string = useMemo(() => params?.id ?? params2?.id ?? '', [params, params2]);
    // Fetch data
    const [getData, { data, loading }] = useLazyQuery<project, projectVariables>(projectQuery, { errorPolicy: 'all'});
    const [project, setProject] = useState<Project | null | undefined>(null);
    useEffect(() => {
        if (uuidValidate(id)) getData({ variables: { input: { id } } })
        else if (adaHandleRegex.test(id)) getData({ variables: { input: { handle: id } } })
    }, [getData, id]);
    useEffect(() => {
        setProject(data?.project);
    }, [data]);
    const canEdit = useMemo<boolean>(() => project?.permissionsProject?.canEdit === true, [project?.permissionsProject?.canEdit]);

    const availableLanguages = useMemo<string[]>(() => (project?.translations?.map(t => getLanguageSubtag(t.language)) ?? []), [project?.translations]);
    const [language, setLanguage] = useState<string>(getUserLanguages(session)[0]);
    useEffect(() => {
        if (availableLanguages.length === 0) return;
        setLanguage(getPreferredLanguage(availableLanguages, getUserLanguages(session)));
    }, [availableLanguages, setLanguage, session]);

    const { canStar, name, description, handle, resourceList } = useMemo(() => {
        const permissions = project?.permissionsProject;
        const resourceList: ResourceList | undefined = Array.isArray(project?.resourceLists) ? project?.resourceLists?.find(r => r.usedFor === ResourceListUsedFor.Display) : undefined;
        return {
            canStar: permissions?.canStar === true,
            name: getTranslation(project, 'name', [language]) ?? getTranslation(partialData, 'name', [language]),
            description: getTranslation(project, 'description', [language]) ?? getTranslation(partialData, 'description', [language]),
            handle: project?.handle ?? partialData?.handle,
            resourceList,
        };
    }, [language, project, partialData]);

    useEffect(() => {
        if (handle) document.title = `${name} ($${handle}) | Vrooli`;
        else document.title = `${name} | Vrooli`;
    }, [handle, name]);

    const resources = useMemo(() => (resourceList || canEdit) ? (
        <ResourceListVertical
            list={resourceList as any}
            session={session}
            canEdit={canEdit}
            handleUpdate={(updatedList) => {
                if (!project) return;
                setProject({
                    ...project,
                    resourceLists: [updatedList]
                })
            }}
            loading={loading}
            mutate={true}
            zIndex={zIndex}
        />
    ) : null, [canEdit, loading, project, resourceList, session, zIndex]);

    // Handle tabs
    const [tabIndex, setTabIndex] = useState<number>(0);
    const handleTabChange = (event, newValue) => { setTabIndex(newValue) };

    /**
     * Calculate which tabs to display
     */
    const availableTabs = useMemo(() => {
        const tabs: TabOptions[] = [];
        // Only display resources if there are any
        if (resources) tabs.push(TabOptions.Resources);
        // Always display others (for now)
        tabs.push(TabOptions.Routines);
        tabs.push(TabOptions.Standards);
        return tabs;
    }, [resources]);

    const currTabType = useMemo(() => tabIndex >= 0 && tabIndex < availableTabs.length ? availableTabs[tabIndex] : null, [availableTabs, tabIndex]);

    const shareLink = useCallback(() => {
        navigator.clipboard.writeText(`https://vrooli.com${APP_LINKS.Project}/${id}`);
        PubSub.get().publishSnack({ message: 'Copied🎉' })
    }, [id]);

    const onEdit = useCallback(() => {
        // Depends on if we're in a search popup or a normal page
        setLocation(Boolean(params?.id) ? `${APP_LINKS.Project}/edit/${id}` : `${APP_LINKS.SearchProjects}/edit/${id}`);
    }, [setLocation, params?.id, id]);

    // More menu
    const [moreMenuAnchor, setMoreMenuAnchor] = useState<any>(null);
    const openMoreMenu = useCallback((ev: MouseEvent<any>) => {
        setMoreMenuAnchor(ev.currentTarget);
        ev.preventDefault();
    }, []);
    const closeMoreMenu = useCallback(() => setMoreMenuAnchor(null), []);

    // Create search data
    const { objectType, itemKeyPrefix, placeholder, searchQuery, where, noResultsText, onSearchSelect } = useMemo<SearchListGenerator>(() => {
        const openLink = (baseLink: string, id: string) => setLocation(`${baseLink}/${id}`);
        // The first tab doesn't have search results, as it is the project's set resources
        switch (currTabType) {
            case TabOptions.Routines:
                return {
                    objectType: ObjectType.Routine,
                    itemKeyPrefix: 'routine-list-item',
                    placeholder: "Search project's routines...",
                    noResultsText: "No routines found",
                    searchQuery: routinesQuery,
                    where: { projectId: id, isComplete: !canEdit ? true : undefined, isInternal: false },
                    onSearchSelect: (newValue) => openLink(APP_LINKS.Routine, newValue.id),
                };
            case TabOptions.Standards:
                return {
                    objectType: ObjectType.Standard,
                    itemKeyPrefix: 'standard-list-item',
                    placeholder: "Search project's standards...",
                    noResultsText: "No standards found",
                    searchQuery: standardsQuery,
                    where: { projectId: id },
                    onSearchSelect: (newValue) => openLink(APP_LINKS.Standard, newValue.id),
                }
            default:
                return {
                    objectType: ObjectType.Routine,
                    itemKeyPrefix: '',
                    placeholder: '',
                    noResultsText: '',
                    searchQuery: null,
                    where: {},
                    onSearchSelect: (o: any) => { },
                    searchItemFactory: (a: any, b: any) => null
                }
        }
    }, [canEdit, currTabType, id, setLocation]);

    /**
     * Displays name, avatar, bio, and quick links
     */
    const overviewComponent = useMemo(() => (
        <Box
            position="relative"
            ml='auto'
            mr='auto'
            mt={3}
            bgcolor={palette.background.paper}
            sx={{
                borderRadius: { xs: '0', sm: 2 },
                boxShadow: { xs: 'none', sm: (containerShadow as any).boxShadow },
                width: { xs: '100%', sm: 'min(500px, 100vw)' }
            }}
        >
            <Tooltip title="See all options">
                <IconButton
                    aria-label="More"
                    size="small"
                    onClick={openMoreMenu}
                    sx={{
                        display: 'block',
                        marginLeft: 'auto',
                        marginRight: 1,
                    }}
                >
                    <EllipsisIcon />
                </IconButton>
            </Tooltip>
            <Stack direction="column" spacing={1} p={1} alignItems="center" justifyContent="center">
                {/* Title */}
                {
                    loading ? (
                        <Stack sx={{ width: '50%', color: 'grey.500', paddingTop: 2, paddingBottom: 2 }} spacing={2}>
                            <LinearProgress color="inherit" />
                        </Stack>
                    ) : canEdit ? (
                        <Stack direction="row" alignItems="center" justifyContent="center">
                            <Typography variant="h4" textAlign="center">{name}</Typography>
                            <Tooltip title="Edit project">
                                <IconButton
                                    aria-label="Edit project"
                                    size="small"
                                    onClick={onEdit}
                                >
                                    <EditIcon sx={{
                                        fill: palette.mode === 'light' ?
                                            palette.primary.main : palette.secondary.light,
                                    }} />
                                </IconButton>
                            </Tooltip>
                        </Stack>
                    ) : (
                        <Typography variant="h4" textAlign="center">{name}</Typography>
                    )
                }
                {/* Handle */}
                {
                    handle && <Link href={`https://handle.me/${handle}`} underline="hover">
                        <Typography
                            variant="h6"
                            textAlign="center"
                            sx={{
                                color: palette.secondary.dark,
                                cursor: 'pointer',
                            }}
                        >${handle}</Typography>
                    </Link>
                }
                {/* Created date */}
                {
                    loading ? (
                        <Box sx={{ width: '33%', color: "#00831e" }}>
                            <LinearProgress color="inherit" />
                        </Box>
                    ) : (
                        project?.created_at && (<Box sx={{ display: 'flex' }} >
                            <CalendarIcon />
                            {`Created ${displayDate(project.created_at, false)}`}
                        </Box>)
                    )
                }
                {/* Description */}
                {
                    loading && (
                        <Stack sx={{ width: '85%', color: 'grey.500' }} spacing={2}>
                            <LinearProgress color="inherit" />
                            <LinearProgress color="inherit" />
                        </Stack>
                    )
                }
                {
                    !loading && Boolean(description) && <Typography variant="body1" sx={{ color: Boolean(description) ? palette.background.textPrimary : palette.background.textSecondary }}>{description}</Typography>
                }
                <Stack direction="row" spacing={2} alignItems="center">
                    <Tooltip title="Donate">
                        <IconButton aria-label="Donate" size="small" onClick={() => { }}>
                            <DonateIcon />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Share">
                        <IconButton aria-label="Share" size="small" onClick={shareLink}>
                            <ShareIcon />
                        </IconButton>
                    </Tooltip>
                    {canStar && <StarButton
                        session={session}
                        objectId={project?.id ?? ''}
                        starFor={StarFor.Project}
                        isStar={project?.isStarred ?? false}
                        stars={project?.stars ?? 0}
                        onChange={(isStar: boolean) => { }}
                        tooltipPlacement="bottom"
                    />}
                </Stack>
            </Stack>
        </Box>
    ), [palette.background.paper, palette.background.textPrimary, palette.background.textSecondary, palette.mode, palette.primary.main, palette.secondary.light, palette.secondary.dark, openMoreMenu, loading, canEdit, name, onEdit, handle, project?.created_at, project?.id, project?.isStarred, project?.stars, description, shareLink, canStar, session]);

    /**
    * Opens add new page
    */
    const toAddNew = useCallback(() => {
        switch (currTabType) {
            case TabOptions.Routines:
                // setLocation(`${APP_LINKS.Routine}/add`);TODO
                break;
            case TabOptions.Standards:
                setLocation(`${APP_LINKS.Standard}/add`);
                break;
        }
    }, [currTabType, setLocation]);

    return (
        <>
            {/* Popup menu displayed when "More" ellipsis pressed */}
            <BaseObjectActionDialog
                handleActionComplete={() => { }} //TODO
                handleEdit={onEdit}
                isUpvoted={project?.isUpvoted}
                isStarred={project?.isStarred}
                objectId={id}
                objectName={name ?? ''}
                objectType={ObjectType.Project}
                anchorEl={moreMenuAnchor}
                title='Project Options'
                onClose={closeMoreMenu}
                permissions={project?.permissionsProject}
                session={session}
                zIndex={zIndex + 1}
            />
            <Box sx={{
                display: 'flex',
                paddingTop: 5,
                paddingBottom: { xs: 0, sm: 2, md: 5 },
                background: palette.mode === 'light' ? "#b2b3b3" : "#303030",
                position: "relative",
            }}>
                {/* Language display/select */}
                <Box sx={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                }}>
                    <SelectLanguageDialog
                        availableLanguages={availableLanguages}
                        canDropdownOpen={availableLanguages.length > 1}
                        currentLanguage={language}
                        handleCurrent={setLanguage}
                        session={session}
                        zIndex={zIndex}
                    />
                </Box>
                {overviewComponent}
            </Box>
            {/* View routines and standards associated with this project */}
            <Box>
                <Box display="flex" justifyContent="center" width="100%">
                    <Tabs
                        value={tabIndex}
                        onChange={handleTabChange}
                        indicatorColor="secondary"
                        textColor="inherit"
                        variant="scrollable"
                        scrollButtons="auto"
                        allowScrollButtonsMobile
                        aria-label="site-statistics-tabs"
                        sx={{
                            marginBottom: 1,
                        }}
                    >
                        {availableTabs.map((tabType, index) => (
                            <Tab
                                key={index}
                                id={`profile-tab-${index}`}
                                {...{ 'aria-controls': `profile-tabpanel-${index}` }}
                                label={<span style={{ color: tabType === TabOptions.Resources ? '#8e6b00' : 'default' }}>{tabType}</span>}
                            />
                        ))}
                    </Tabs>
                </Box>
                <Box p={2}>
                    {
                        currTabType === TabOptions.Resources ? resources : (
                            <SearchList
                                canSearch={uuidValidate(id)}
                                handleAdd={toAddNew}
                                hideRoles={true}
                                itemKeyPrefix={itemKeyPrefix}
                                noResultsText={noResultsText}
                                objectType={objectType}
                                onObjectSelect={onSearchSelect}
                                query={searchQuery}
                                searchPlaceholder={placeholder}
                                session={session}
                                take={20}
                                where={where}
                                zIndex={zIndex}
                            />
                        )
                    }
                </Box>
            </Box>
        </>
    )
}