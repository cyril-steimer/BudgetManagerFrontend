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
    constructor(readonly text: string, readonly url: string) {
    }
}

interface CardParameters {
    title: string;
    text: string;
    disableButtons: boolean;
    buttons: CardButton[];
}

function DashboardCard({title, text, disableButtons, buttons}: CardParameters) {
    const navigate = useNavigate();

    function click(button: CardButton) {
        navigate(button.url);
    }

    return (
        <Grid2 xs={6}>
            <Card variant="outlined">
                <StyledCardHeader title={<Typography variant="h6">{title}</Typography>}></StyledCardHeader>
                <CardContent>
                    <Typography>{text}</Typography>
                </CardContent>
                <CardActions>
                    {buttons.map(b => <Button key={b.text} type="button" onClick={() => click(b)} disabled={disableButtons}>{b.text}</Button>)}
                </CardActions>
            </Card>
        </Grid2>
    );
}

export default function Dashboard() {
    const [loadingExpenses, setLoadingExpenses] = useState(false);
    const [expenses, setExpenses] = useState<Expense[]>();
    const [search, setSearch] = useState('');
    const now = dayjs();

    const disableButtons = useIsNavigating() || loadingExpenses;

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
                    new CardButton('This Month', `/expenses/year/${now.year()}/month/${now.month() + 1}`),
                    new CardButton('This Year', `/expenses/year/${now.year()}`),
                    new CardButton('All Time', '/expenses')
                ]}
            />
            <DashboardCard
                title="Budget"
                text="Check the state of your budget during the current month or year"
                disableButtons={disableButtons}
                buttons={[
                    new CardButton('This Month', '/missing'),
                    new CardButton('This Year', '/missing')
                ]}
            />
            <DashboardCard
                title="Import/Export"
                text="Import or export all expense/budget data. The data can then be used in another instance of the budget manager"
                disableButtons={disableButtons}
                buttons={[
                    new CardButton('Import/Export', '/missing')
                ]}
            />
            <DashboardCard
                title="Templates"
                text="View the list of templates"
                disableButtons={disableButtons}
                buttons={[
                    new CardButton('All Templates', '/templates')
                ]}
            />
            <DashboardCard
                title="Scheduled Expenses"
                text="View the list of scheduled expenses"
                disableButtons={disableButtons}
                buttons={[
                    new CardButton('All Scheduled Expenses', '/schedules')
                ]}
            />
        </Grid2>
    );
}
