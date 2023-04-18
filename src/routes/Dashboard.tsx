import {useNavigate} from 'react-router-dom';
import dayjs from 'dayjs';
import {useIsNavigating} from '../hooks/hooks';
import {Button, Card, CardActions, CardContent, CardHeader, cardHeaderClasses, TextField, Typography} from '@mui/material';
import Grid2 from '@mui/material/Unstable_Grid2';
import {styled} from '@mui/material/styles';
import {useState} from 'react';
import {Expense} from '../model/expense';
import {ExpensesTable} from '../components/Expenses-Table';
import {filterExpenses} from './Expenses';

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
    disableButtons: boolean;
    buttons: CardButton[];
}

function DashboardCard({title, text, disableButtons, buttons}: CardParameters) {
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
    const [loadingExpenses, setLoadingExpenses] = useState(false);
    const [expenses, setExpenses] = useState<Expense[]>();
    const [search, setSearch] = useState('');
    const now = dayjs();

    const disableButtons = useIsNavigating() || loadingExpenses;

    function monthlyExpenses() {
        navigate(`/expenses/year/${now.year()}/month/${now.month() + 1}`);
    }

    function yearlyExpenses() {
        navigate(`/expenses/year/${now.year()}`);
    }

    function allExpenses() {
        navigate('/expenses');
    }

    function templates() {
        navigate('/templates');
    }

    function schedules() {
        navigate('/schedules');
    }

    function notYetImplemented() {
        alert('Not yet implemented');
    }

    async function searchExpenses() {
        if (search === '') {
            setExpenses(undefined);
        } else {
            setLoadingExpenses(true);
            const expenses = await filterExpenses(search);
            setExpenses(expenses.values);
            setLoadingExpenses(false);
        }
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
                    sx={{height: '100%'}}
                    fullWidth={true}
                    type="button"
                    variant="outlined"
                    onClick={searchExpenses}
                    disabled={disableButtons}
                >
                    Search Expenses
                </Button>
            </Grid2>
            {expenses && (
                <Grid2 xs={12}>
                    <ExpensesTable expenses={expenses}/>
                </Grid2>
            )}
            <DashboardCard
                title="Expenses"
                text="View the list of all expenses during a certain time frame"
                disableButtons={disableButtons}
                buttons={[
                    new CardButton('This Month', monthlyExpenses),
                    new CardButton('This Year', yearlyExpenses),
                    new CardButton('All Time', allExpenses)
                ]}
            />
            <DashboardCard
                title="Budget"
                text="Check the state of your budget during the current month or year"
                disableButtons={disableButtons}
                buttons={[
                    new CardButton('This Month', notYetImplemented),
                    new CardButton('This Year', notYetImplemented)
                ]}
            />
            <DashboardCard
                title="Import/Export"
                text="Import or export all expense/budget data. The data can then be used in another instance of the budget manager"
                disableButtons={disableButtons}
                buttons={[
                    new CardButton('Import/Export', notYetImplemented)
                ]}
            />
            <DashboardCard
                title="Templates"
                text="View the list of templates"
                disableButtons={disableButtons}
                buttons={[
                    new CardButton('All Templates', templates)
                ]}
            />
            <DashboardCard
                title="Scheduled Expenses"
                text="View the list of scheduled expenses"
                disableButtons={disableButtons}
                buttons={[
                    new CardButton('All Scheduled Expenses', schedules)
                ]}
            />
        </Grid2>
    );
}
