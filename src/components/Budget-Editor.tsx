import {useState} from "react";
import {EditorMode, ModifyingEndpoint} from "../endpoints/endpoint";
import {Budget, BudgetAmount, BudgetAmountPeriod} from "../model/budget";
import {Box, Button, Grid, Stack, Typography} from "@mui/material";
import {CurrencyAmountInput, Dropdown, EditButtons, MonthYearPicker, TextInput} from "./Editor";
import {useIsNavigating} from "../hooks/hooks";
import {useNavigate} from "react-router-dom";
import dayjs from "dayjs";
import {DECEMBER, JANUARY, MonthYear, compareMonthYear, dayJsObjectToMonthYear, namedObject} from "../model/common";
import AddIcon from '@mui/icons-material/Add';
import {submitData} from "../routes/Endpoint-Routes";

export interface BudgetEditorParameters {
    endpoint: ModifyingEndpoint<Budget>;
    initialBudget: Partial<Budget>;
    mode: EditorMode;
}

type EditableBudgetAmount = Omit<BudgetAmount, 'amount'> & {
    amount: string;
    dateError: string | undefined;
    amountValid: boolean;
};

function newBudgetAmount(): BudgetAmount {
    return {
        amount: {
            amount: 0.0
        },
        from: dayJsObjectToMonthYear(dayjs().month(JANUARY)),
        to: dayJsObjectToMonthYear(dayjs().month(DECEMBER)),
        period: 'monthly'
    };
}

function toEditable(original: BudgetAmount): EditableBudgetAmount {
    return {
        ...original,
        amount: original.amount.amount.toFixed(2),
        dateError: dateError(original.from, original.to),
        amountValid: true
    };
}

function fromEditable(editable: EditableBudgetAmount): BudgetAmount {
    return {
        amount: { amount: parseFloat(editable.amount) },
        period: editable.period,
        from: editable.from,
        to: editable.to
    };
}

function dateError(from: MonthYear, to: MonthYear): string | undefined {
    return compareMonthYear(from, to) > 0 ? 'Start Date must be before End Date' : undefined;
}

type EditableBudgetAmountChange<K extends keyof EditableBudgetAmount> = [K, EditableBudgetAmount[K]];

const periods: BudgetAmountPeriod[] = ['monthly', 'yearly'];

export function BudgetEditor({endpoint, initialBudget, mode}: BudgetEditorParameters) {

    const [category, setCategory] = useState(initialBudget.category?.name ?? '');
    // TODO Sort initially? (Probably don't sort afterwards, that would be confusing. Maybe add a sort button?)
    // TODO Validate that no two periods overlap?
    const [budgetAmounts, setBudgetAmounts] = useState((initialBudget.amounts ?? [newBudgetAmount()]).map(amt => toEditable(amt)));

    const categoryError = category === '' ? 'This field is mandatory' : undefined;
    const hasAmountError = budgetAmounts.find(amt => amt.dateError !== undefined || !amt.amountValid) !== undefined;
    const anyError = categoryError !== undefined || hasAmountError

    const [isSubmitting, setSubmitting] = useState(false);
    const isNavigating = useIsNavigating() || isSubmitting;
    const navigate = useNavigate();

    function addBudgetAmount() {
        setBudgetAmounts([...budgetAmounts, toEditable(newBudgetAmount())]);
    }

    function updateBudgetAmount<K1 extends keyof EditableBudgetAmount, K2 extends keyof EditableBudgetAmount>(index: number, change1: EditableBudgetAmountChange<K1>, change2?: EditableBudgetAmountChange<K2>) {
        const newAmount = {...budgetAmounts[index]};
        newAmount[change1[0]] = change1[1];
        if (change2 !== undefined) {
            newAmount[change2[0]] = change2[1];
        }
        const newAmounts = [...budgetAmounts];
        newAmounts[index] = newAmount;
        setBudgetAmounts(newAmounts);
    }

    function Header({text}: {text: string}) {
        return (
            <Typography variant='body1' sx={{fontWeight: 'bold'}}>
               {text}
            </Typography>
        );
    }

    async function submitBudget() {
        const budget: Budget = {
            category: namedObject(category),
            amounts: budgetAmounts.map(amt => fromEditable(amt))
        };
        await submitData(endpoint, mode, budget, setSubmitting);
        navigate(-1); // Go back to the previous page
    }

    return (
        <Box component='form'>
            <TextInput
                label='Category'
                value={category}
                setValue={setCategory}
                errorText={categoryError}
                disabled={isNavigating}
            />
            <Stack direction='column' spacing={2}>
                <Stack direction='row' spacing={2}>
                    <Typography variant='h6'>
                        Budgets
                    </Typography>
                    <Button
                        variant='outlined'
                        startIcon={<AddIcon/>}
                        onClick={addBudgetAmount}
                        disabled={isNavigating}
                    >
                        Add Budget
                    </Button>
                </Stack>
                <Grid container spacing={2}>
                    <Grid xs={2} item>
                        <Header text='Amount'></Header>
                    </Grid>
                    <Grid xs={2} item>
                        <Header text='Period'></Header>
                    </Grid>
                    <Grid xs={4} item>
                        <Header text='From'></Header>
                    </Grid>
                    <Grid xs={4} item>
                        <Header text='To'></Header>
                    </Grid>
                </Grid>
                {budgetAmounts.map((amount, index) =>
                    <Grid container key={index}>
                        <Grid xs={2} item>
                            <CurrencyAmountInput
                                label='Amount'
                                value={amount.amount}
                                setValue={(value, valid) => updateBudgetAmount(index, ['amount', value], ['amountValid', valid])}
                                disabled={isNavigating}
                            />
                        </Grid>
                        <Grid xs={2} item>
                            <Dropdown
                                label='Period'
                                value={amount.period}
                                setValue={value => updateBudgetAmount(index, ['period', value as BudgetAmountPeriod])}
                                options={periods}
                                disabled={isNavigating}
                            />
                        </Grid>
                        <Grid xs={4} item>
                            <MonthYearPicker
                                required
                                label='From'
                                value={amount.from}
                                setValue={from => updateBudgetAmount(index, ['from', from], ['dateError', dateError(from, amount.to)])}
                                maxDate={amount.to}
                                helperText={amount.dateError}
                                disabled={isNavigating}
                            />
                        </Grid>
                        <Grid xs={4} item>
                            <MonthYearPicker
                                required
                                label='To'
                                value={amount.to}
                                setValue={to => updateBudgetAmount(index, ['to', to], ['dateError', dateError(amount.from, to)])}
                                minDate={amount.from}
                                helperText={amount.dateError}
                                disabled={isNavigating}
                            />
                        </Grid>
                    </Grid>
                )}
                <EditButtons
                    mode={mode}
                    endpoint={endpoint}
                    id={category}
                    hasError={anyError}
                    isNavigating={isNavigating}
                    setSubmitting={setSubmitting}
                    onSubmit={submitBudget}
                />
            </Stack>
        </Box>
    );
}