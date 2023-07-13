import {useNavigate} from 'react-router-dom';
import dayjs from 'dayjs';
import {useIsNavigating} from '../hooks/hooks';
import {Button, Card, CardActions, CardContent, CardHeader, cardHeaderClasses, Fab, Menu, MenuItem, TextField, Typography} from '@mui/material';
import Grid2 from '@mui/material/Unstable_Grid2';
import {styled} from '@mui/material/styles';
import {useState} from 'react';
import {Expense} from '../model/expense';
import {ExpensesTable} from '../components/Expenses-Table';
import {ExpenseEndpoint, ExpenseTemplateEndpoint, ScheduledExpenseEndpoint} from '../endpoints/expense-endpoints';
import {ModifyingEndpoint, QueryingEndpoint, isTimeBasedEndpoint, isViewAllEndpoint} from '../endpoints/endpoint';
import {getAddUrl, getMonthlyDataUrl, getYearlyDataUrl} from './Endpoint-Routes';
import {BudgetInPeriodEndpoint} from '../endpoints/budget-endpoints';
import AddIcon from '@mui/icons-material/Add';

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

function cardButtons<T>(endpoint: QueryingEndpoint<T>, viewAllText?: string): CardButton[] {
    const now = dayjs();
    const result: CardButton[] = [];
    if (isTimeBasedEndpoint(endpoint)) {
        result.push({
            text: 'This Month',
            url: getMonthlyDataUrl(endpoint, now.year(), now.month())
        });
        result.push({
            text: 'This Year',
            url: getYearlyDataUrl(endpoint, now.year())
        });
    }
    if (isViewAllEndpoint(endpoint)) {
        result.push({
            text: viewAllText ?? 'All Time',
            url: endpoint.viewAllPath
        });
    }
    return result;
}

function AddMenuItem<T>({endpoint}: {endpoint: ModifyingEndpoint<T>}) {
    const navigate = useNavigate();

    return (
        <MenuItem onClick={() => navigate(getAddUrl(endpoint))}>
            {endpoint.addText}
        </MenuItem>
    );
}

export default function Dashboard() {
    const [loadingExpenses, setLoadingExpenses] = useState(false);
    const [expenses, setExpenses] = useState<Expense[]>();
    const [search, setSearch] = useState('');

    const disableButtons = useIsNavigating() || loadingExpenses;
    const expenseEndpoint = new ExpenseEndpoint();
    const expenseTemplateEndpoint = new ExpenseTemplateEndpoint();

    async function searchExpenses() {
        if (search === '') {
            setExpenses(undefined);
        } else {
            setLoadingExpenses(true);
            const expenses = await expenseEndpoint.loadDataForFilter(search);
            setExpenses(expenses.values);
            setLoadingExpenses(false);
        }
    }

    const [addMenuAnchor, setAddMenuAnchor] = useState<HTMLElement | undefined>();
    const openAddMenu = addMenuAnchor !== undefined;
    const closeAddMenu = () => setAddMenuAnchor(undefined);

    return (
        <div>
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
                        <ExpensesTable endpoint={expenseEndpoint} expenses={expenses}/>
                    </Grid2>
                )}
                <DashboardCard
                    title="Expenses"
                    text="View the list of all expenses during a certain time frame"
                    disableButtons={disableButtons}
                    buttons={cardButtons(expenseEndpoint)}
                />
                <DashboardCard
                    title="Budget"
                    text="Check the state of your budget during the current month or year"
                    disableButtons={disableButtons}
                    buttons={cardButtons(new BudgetInPeriodEndpoint())}
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
                    buttons={cardButtons(expenseTemplateEndpoint, 'All Templates')}
                />
                <DashboardCard
                    title="Scheduled Expenses"
                    text="View the list of scheduled expenses"
                    disableButtons={disableButtons}
                    buttons={cardButtons(new ScheduledExpenseEndpoint(), 'All Scheduled Expenses')}
                />
            </Grid2>
            <Fab
                color='primary'
                sx={{position: 'absolute', bottom: 16, right: 16}}
                onClick={event => setAddMenuAnchor(event.currentTarget)}
            >
                <AddIcon/>
            </Fab>
            <Menu
                open={openAddMenu}
                anchorEl={addMenuAnchor}
                onClose={closeAddMenu}
            >
                <AddMenuItem endpoint={expenseEndpoint}/>
                <AddMenuItem endpoint={expenseTemplateEndpoint}/>
            </Menu>
        </div>
    );
}
