// Used to display popular/search results of a particular object type
import { Box, ListItem, ListItemButton, ListItemText, Stack, Tooltip, useTheme } from '@mui/material';
import { UserListItemProps } from '../types';
import { multiLineEllipsis } from 'styles';
import { useCallback, useMemo } from 'react';
import { APP_LINKS, StarFor, UserSortBy } from '@local/shared';
import { useLocation } from 'wouter';
import { StarButton } from '..';
import { getTranslation, LabelledSortOption, labelledSortOptions, listItemColor, placeholderColor } from 'utils';
import { Person as PersonIcon } from '@mui/icons-material';
import { TextLoading } from '../TextLoading/TextLoading';

export const UserListItem = ({
    data,
    index,
    loading,
    onClick,
    session,
    tooltip = 'View details',
}: UserListItemProps) => {
    const { palette } = useTheme();
    const [, setLocation] = useLocation();
    const isOwn = useMemo(() => data?.id === session?.id, [data, session]);

    const profileColors = useMemo(() => placeholderColor(), []);

    const { bio, name } = useMemo(() => {
        const languages = session?.languages ?? navigator.languages;
        return {
            bio: getTranslation(data, 'bio', languages, true),
            name: data?.name ?? (data?.handle ? `$${data.handle}` : ''),
        }
    }, [data, session]);

    const handleClick = useCallback((e: any) => {
        // Prevent propagation
        e.stopPropagation();
        // If data not supplied, don't open
        if (!data) return;
        // If onClick provided, call it
        if (onClick) onClick(e, data);
        // Otherwise, navigate to the user's profile
        else {
            // Prefer using handle if available
            const link = data.handle ?? data.id;
            setLocation(`${APP_LINKS.Profile}/${link}`);
        }
    }, [onClick, data, setLocation]);

    return (
        <Tooltip placement="top" title={tooltip ?? 'View Details'}>
            <ListItem
                disablePadding
                onClick={handleClick}
                sx={{
                    display: 'flex',
                    background: listItemColor(index, palette),
                }}
            >
                <ListItemButton component="div" onClick={handleClick}>
                    <Box
                        alignItems='center'
                        bgcolor={profileColors[0]}
                        borderRadius='100%'
                        height="50px"
                        justifyContent='center'
                        minWidth="50px"
                        width="50px"
                        sx={{
                            display: { xs: 'none', sm: 'flex' },
                        }}
                    >
                        <PersonIcon sx={{
                            fill: profileColors[1],
                            height: '80%',
                            width: '80%',
                        }} />
                    </Box>
                    <Stack direction="column" spacing={1} pl={2} sx={{ width: '-webkit-fill-available' }}>
                        {loading ? <TextLoading /> : <ListItemText
                            primary={name}
                            sx={{ ...multiLineEllipsis(1) }}
                        />}
                        {loading ? <TextLoading /> : <ListItemText
                            primary={bio}
                            sx={{ ...multiLineEllipsis(2), color: palette.text.secondary }}
                        />}
                    </Stack>
                    {
                        !isOwn && <StarButton
                            isStar={data?.isStarred}
                            objectId={data?.id ?? ''}
                            onChange={(isStar: boolean) => { }}
                            session={session}
                            starFor={StarFor.User}
                            stars={data?.stars}
                        />
                    }
                </ListItemButton>
            </ListItem>
        </Tooltip>
    )
}

export const UserSortOptions: LabelledSortOption<UserSortBy>[] = labelledSortOptions(UserSortBy);
export const userDefaultSortOption = UserSortOptions[1];