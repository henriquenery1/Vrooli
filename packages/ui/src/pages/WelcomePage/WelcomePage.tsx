import { APP_LINKS } from '@local/shared';
import { Box, Button, Link, Stack, Typography, useTheme } from '@mui/material';
import {
    Help as FAQIcon,
    Article as WhitePaperIcon,
    AccountCircle as ProfileIcon,
    PlayCircle as ExampleIcon,
    YouTube as VideoIcon,
} from '@mui/icons-material';
import { useLocation } from 'wouter';
import { clickSize } from 'styles';

/**
 * 
 */

const buttonProps = {
    height: "48px",
    background: "white",
    color: "black",
    borderRadius: "10px",
    width: "20em",
    display: "flex",
    marginBottom: "5px",
    transition: "0.3s ease-in-out",
    '&:hover': {
        filter: `brightness(120%)`,
        color: 'white',
        border: '1px solid white',
    }
}

export const WelcomePage = () => {
    const [, setLocation] = useLocation();
    const { breakpoints } = useTheme();
    const openLink = (link: string) => window.open(link, '_blank', 'noopener,noreferrer');

    return (
        <Box
            sx={{
                minHeight: '100vh',
                width: '100vw',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                textAlign: 'center',
                background: `linear-gradient(-46deg, #ffba65, #b3629e, #1a5fb5, #41bbb5) 50%/cover no-repeat fixed`,
                backgroundSize: '400% 400%',
                animation: 'gradient 15s ease infinite',
                overflowX: 'hidden',
                paddingTop: '64px',
                [breakpoints.up('md')]: {
                    paddingTop: '10vh',
                },
            }}
        >
            <Box sx={{
                boxShadow: `rgb(0 0 0 / 50%) 0px 0px 35px 0px`,
                padding: 2,
                borderRadius: 2,
                overflow: 'overlay',
                marginTop: '-5vh',
                backgroundColor: '#3232324f',
                backdropFilter: 'blur(10px)',
                color: 'white',
            }}>
                <Typography component="h1" variant="h2" mb={1}>Welcome to Vrooli!</Typography>
                <Typography component="h2" variant="h4" mb={3}>Not sure where to start?</Typography>
                <Stack direction="column" spacing={1} mb={2} sx={{ alignItems: 'center' }}>
                    <Button
                        onClick={() => openLink("https://www.youtube.com/watch?v=hBHaPYi5esQ")}
                        startIcon={<VideoIcon />}
                        sx={{ ...buttonProps, marginBottom: 0 }}
                    >Understand the vision</Button>
                    <Button
                        onClick={() => setLocation(APP_LINKS.FAQ)}
                        startIcon={<FAQIcon />}
                        sx={{ ...buttonProps, marginBottom: 0 }}
                    >Read the FAQ</Button>
                    <Button
                        onClick={() => openLink("https://docs.google.com/document/d/1zHYdjAyy01SSFZX0O-YnZicef7t6sr1leOFnynQQOx4?usp=sharing")}
                        startIcon={<WhitePaperIcon />}
                        sx={{ ...buttonProps, marginBottom: 0 }}
                    >Read the White Paper</Button>
                    <Button
                        onClick={() => setLocation(`${APP_LINKS.Settings}?page=profile`)}
                        startIcon={<ProfileIcon />}
                        sx={{ ...buttonProps, marginBottom: 0 }}
                    >Set Up Profile</Button>
                    <Button
                        onClick={() => setLocation(APP_LINKS.Example)}
                        startIcon={<ExampleIcon />}
                        sx={{ ...buttonProps, marginBottom: 0 }}
                    >Run Example</Button>
                </Stack>
                <Box sx={{
                    ...clickSize,
                    justifyContent: 'end',
                }}
                >
                    <Link onClick={() => setLocation(APP_LINKS.Home)} sx={{
                        cursor: 'pointer',
                        '&:hover': {
                            brightness: '120%',
                        }
                    }}>
                        <Typography sx={{ marginRight: 2, color: (t) => t.palette.secondary.light }}>I know what I'm doing</Typography>
                    </Link>
                </Box>
            </Box>
        </Box>
    )
}