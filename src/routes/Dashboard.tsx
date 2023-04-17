import {useNavigate} from 'react-router-dom';
import dayjs from 'dayjs';
import {useIsNavigating} from '../hooks/hooks';
import {Button, Card, CardActions, CardContent, CardHeader, cardHeaderClasses, TextField, Typography} from '@mui/material';
import Grid2 from '@mui/material/Unstable_Grid2';
import {styled} from '@mui/material/styles';
import {useState} from 'react';

const StyledCardHeader = styled(CardHeader)(({theme}) => ({
    [`&.${cardHeaderClasses.root}`]: {
        backgroundColor: theme.palette.action.hover
    }
}));

class CardButton {
    constructor(readonly text: string, readonly action: () => void) {
    }
}

interface CardParameters {
    title: string;
    text: string;
    buttons: CardButton[];
}

function DashboardCard({title, text, buttons}: CardParameters) {
    const disableButtons = useIsNavigating();

    return (
        <Grid2 xs={6}>
            <Card variant="outlined">
                <StyledCardHeader title={<Typography variant="h6">{title}</Typography>}></StyledCardHeader>
                <CardContent>
                    <Typography>{text}</Typography>
                </CardContent>
                <CardActions>
                    {buttons.map(b => <Button key={b.text} type="button" onClick={b.action} disabled={disableButtons}>{b.text}</Button>)}
                </CardActions>
            </Card>
        </Grid2>
    );
}

export default function Dashboard() {
    const navigate = useNavigate();
    const [search, setSearch] = useState('');

    function viewThisMonth() {
        viewMonthlyExpenses(dayjs());
    }

    function notYetImplemented() {
        alert('Not yet implemented');
    }

    function searchExpenses() {
        alert(`Searching for '${search}'`);
    }

    function viewMonthlyExpenses(date: dayjs.Dayjs) {
        const url = `/expenses/year/${date.year()}/month/${date.month() + 1}`;
        navigate(url);
    }

    return (
        <Grid2 container spacing={2}>
            <Grid2 xs={9}>
                <TextField
                    fullWidth={true}
                    size="small"
                    variant="outlined"
                    label="Search"
                    placeholder="Expense name, category, amount, etc."
                    type="text"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                />
            </Grid2>
            <Grid2 xs={3}>
                <Button
                    sx={{height: "100%"}}
                    fullWidth={true}
                    type="button"
                    variant="outlined"
                    onClick={searchExpenses}
                >
                    Search Expenses
                </Button>
            </Grid2>
            <DashboardCard
                title="Expenses"
                text="View the list of all expenses during a certain time frame"
                buttons={[
                    new CardButton('This Month', viewThisMonth),
                    new CardButton('This Year', notYetImplemented),
                    new CardButton('All Time', notYetImplemented)
                ]}
            />
            <DashboardCard
                title="Budget"
                text="Check the state of your budget during the current month or year"
                buttons={[
                    new CardButton('This Month', notYetImplemented),
                    new CardButton('This Year', notYetImplemented)
                ]}
            />
            <DashboardCard
                title="Import/Export"
                text="Import or export all expense/budget data. The data can then be used in another instance of the budget manager"
                buttons={[
                    new CardButton('Import/Export', notYetImplemented)
                ]}
            />
            <DashboardCard
                title="Templates"
                text="View the list of templates"
                buttons={[
                    new CardButton('All Templates', notYetImplemented)
                ]}
            />
            <DashboardCard
                title="Scheduled Expenses"
                text="View the list of scheduled expenses"
                buttons={[
                    new CardButton('All Scheduled Expenses', notYetImplemented)
                ]}
            />
        </Grid2>
    );
}
