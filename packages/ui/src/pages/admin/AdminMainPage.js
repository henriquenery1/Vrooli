import React from 'react';
import { useHistory } from 'react-router-dom';
import { combineStyles, LINKS } from 'utils';
import { Typography, Card, CardContent, CardActions, Tooltip, IconButton } from '@material-ui/core';
import { Launch as LaunchIcon } from '@material-ui/icons';
import { makeStyles } from '@material-ui/styles';
import { pageStyles } from '../styles';

const componentStyles = (theme) => ({
    card: {
        background: theme.palette.primary.main,
        color: theme.palette.primary.contrastText,
        cursor: 'pointer',
    },
    flexed: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gridGap: '20px',
        alignItems: 'stretch',
    },
    icon: {
        color: theme.palette.secondary.light,
    },
})

const useStyles = makeStyles(combineStyles(pageStyles, componentStyles));

function AdminMainPage() {
    let history = useHistory();
    const classes = useStyles();

    const card_data = [
        ['Customers', "Approve new customers, edit customer information", LINKS.AdminCustomers],
        ['Images', "Add, remove, and rearrange images for slides lists", LINKS.AdminImages],
        ['Contact Info', "Edit business hours and other contact information", LINKS.AdminContactInfo],
    ]

    return (
        <div id='page'>
            <div className={classes.header}>
                <Typography variant="h3" component="h1">Manage Site</Typography>
            </div>
            <div className={classes.flexed}>
                {card_data.map(([title, description, link]) => (
                    <Card className={classes.card} onClick={() => history.push(link)}>
                        <CardContent>
                            <Typography variant="h5" component="h2">
                                {title}
                            </Typography>
                            <Typography variant="body2" component="p">
                                {description}
                            </Typography>
                        </CardContent>
                        <CardActions>
                            <Tooltip title="Open" placement="bottom">
                                <IconButton onClick={() => history.push(link)}>
                                    <LaunchIcon className={classes.icon} />
                                </IconButton>
                            </Tooltip>
                        </CardActions>
                    </Card>
                ))}
            </div>
        </div >
    );
}

AdminMainPage.propTypes = {
}

export { AdminMainPage };