import {BaseExpense, Expense, ExpenseTemplate, Schedule, ScheduledExpense, allSchedules, isMonthlySchedule, isWeeklySchedule, scheduleToString} from "../model/expense";
import {useEffect, useState} from "react";
import {Autocomplete, Box, Button, Stack, TextField} from "@mui/material";
import {NamedObject, compareDateStruct, dateStructNow} from "../model/common";
import {DateStructPicker, CurrencyAmountInput, TextInput, commonTextFieldProperties, Dropdown} from "./Editor";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SendIcon from '@mui/icons-material/Send';
import {useIsNavigating} from "../hooks/hooks";
import {useNavigate} from "react-router-dom";
import {ModifyingEndpoint} from "../endpoints/endpoint";
import {submitData} from "../routes/Endpoint-Routes";
import {getAllAuthors, getAllBudgetCategories, getAllPaymentMethods, getAllTags} from "../endpoints/helpers";

function namedObject(value: string): NamedObject {
    return {
        name: value
    };
}

function loadAutocompleteData(loaderFunc: () => Promise<string[]>, setData: (values: string[]) => void) {
    loaderFunc().then(promise => setData(promise)); // TODO Error handling
}

type TemplateType = 'template';
type ScheduleType = 'schedule';
type ExpenseType = 'expense';
type ExpenseSelector = TemplateType | ScheduleType | ExpenseType;

type ExpenseImplementation<ExpenseTypes> = ExpenseTypes extends TemplateType
    ? ExpenseTemplate
    : (ExpenseTypes extends ScheduleType ? ScheduledExpense : Expense);

interface BaseExpenseEditorParameters<T extends ExpenseSelector> {
    endpoint: ModifyingEndpoint<ExpenseImplementation<T>>;
    initialExpense: ExpenseImplementation<T>;
    type: T;
}

function as<T extends ExpenseSelector>(expected: T, actual: ExpenseSelector, expense: ExpenseImplementation<ExpenseSelector>): ExpenseImplementation<T> | undefined {
    if (expected === actual) {
        return expense as ExpenseImplementation<T>;
    }
    return undefined;
}

type FullExpense = {
    [Property in keyof (Expense & ScheduledExpense & ExpenseTemplate)]: (Expense & ScheduledExpense & ExpenseTemplate)[Property]
}

function createExpense<T extends ExpenseSelector>(type: T, values: FullExpense): ExpenseImplementation<T> {
    const baseExpense: BaseExpense = {
        id: values.id,
        name: values.name,
        amount: values.amount,
        category: values.category,
        author: values.author,
        method: values.method,
        tags: values.tags
    };
    switch (type) {
        case 'expense': {
            const expense: Expense = {
                ...baseExpense,
                date: values.date
            };
            return expense as ExpenseImplementation<T>;
        }
        case 'schedule': {
            const schedule: ScheduledExpense = {
                ...baseExpense,
                schedule: values.schedule,
                startDate: values.startDate,
                endDate: values.endDate
            };
            return schedule as ExpenseImplementation<T>;
        }
        case 'template': {
            const template: ExpenseTemplate = baseExpense;
            return template as ExpenseImplementation<T>
        }
    }
    throw new Error(`Unexpected expense type: ${type}`);
}

const defaultSchedule: Schedule = { dayOfMonth: 1 };

function getScheduleGroup(schedule: Schedule): string {
    if (isMonthlySchedule(schedule)) {
        return 'Monthly Schedules';
    } else if (isWeeklySchedule(schedule)) {
        return 'Weekly Schedules';
    }
    throw new Error(`Unsupported schedule: ${JSON.stringify(schedule)}`);
}

function BaseExpenseEditor<T extends ExpenseSelector>({type, initialExpense, endpoint}: BaseExpenseEditorParameters<T>) {

    const [name, setName] = useState(initialExpense.name.name);
    const [amount, setAmount] = useState(initialExpense.amount.amount.toFixed(2));
    const [category, setCategory] = useState(initialExpense.category.name);
    const [date, setDate] = useState(as('expense', type, initialExpense)?.date ?? dateStructNow());
    const [method, setMethod] = useState(initialExpense.method.name);
    const [author, setAuthor] = useState(initialExpense.author.name);
    const [tags, setTags] = useState(initialExpense.tags.map(t => t.name));
    const [startDate, setStartDate] = useState(as('schedule', type, initialExpense)?.startDate ?? dateStructNow());
    const [endDate, setEndDate] = useState(as('schedule', type, initialExpense)?.endDate);
    const [schedule, setSchedule] = useState(as('schedule', type, initialExpense)?.schedule ?? defaultSchedule)



    const [categoryOptions, setCategoryOptions] = useState<string[]>(['woohoo']);
    const [authorOptions, setAuthorOptions] = useState<string[]>();
    const [paymentMethodOptions, setPaymentMethodOptions] = useState<string[]>();
    const [tagOptions, setTagOptions] = useState<string[]>();

    const [amountValid, setAmountValid] = useState(true);

    const categoryError = category === '' ? 'This field is mandatory' : undefined;
    const nameError = name === '' ? 'This field is mandatory' : undefined;
    const dateError = endDate !== undefined && compareDateStruct(startDate, endDate) > 0;
    const anyError = categoryError !== undefined || nameError !== undefined || !amountValid || dateError;

    const [isSubmitting, setSubmitting] = useState(false);
    const isNavigating = useIsNavigating() || isSubmitting;
    const navigate = useNavigate();

    async function submitExpense() {
        const expense = createExpense(type, {
            id: initialExpense.id,
            name: namedObject(name),
            amount: { amount: parseFloat(amount) },
            category: namedObject(category),
            method: namedObject(method),
            author: namedObject(author),
            tags: tags.map(tag => namedObject(tag)),
            // Expense
            date,
            // Scheduled Expense
            startDate,
            endDate,
            schedule
        });
        await submitData(endpoint, 'post', expense, setSubmitting);
        navigate(-1); // Go back to the previous page
    }

    useEffect(() => loadAutocompleteData(getAllBudgetCategories, setCategoryOptions), []);
    useEffect(() => loadAutocompleteData(getAllAuthors, setAuthorOptions), []);
    useEffect(() => loadAutocompleteData(getAllPaymentMethods, setPaymentMethodOptions), []);
    useEffect(() => loadAutocompleteData(getAllTags, setTagOptions), []);

    return (
        <Box component='form'>
            <TextInput
                label='Name'
                value={name}
                setValue={setName}
                errorText={nameError}
                disabled={isNavigating}
            />
            <CurrencyAmountInput
                label='Amount'
                value={amount}
                setValue={setAmount}
                setValid={setAmountValid}
                disabled={isNavigating}
            />
            <Dropdown
                label='Category'
                value={category}
                setValue={setCategory}
                options={categoryOptions}
                disabled={isNavigating}
                errorText={categoryError}
            />
            {type === 'expense' &&
                <DateStructPicker
                    label='Date'
                    required
                    value={date}
                    setValue={setDate}
                    disabled={isNavigating}
                />
            }
            {type === 'schedule' && 
                <DateStructPicker
                    label='Start Date'
                    required
                    value={startDate}
                    setValue={setStartDate}
                    maxDate={endDate}
                    helperText={dateError ? 'Start Date must be before End Date' : undefined}
                    disabled={isNavigating}
                />
            }
            {type === 'schedule' && 
                <DateStructPicker
                    label='End Date'
                    value={endDate}
                    setValue={setEndDate}
                    minDate={startDate}
                    helperText={dateError ? 'Start Date must be before End Date' : undefined}
                    disabled={isNavigating}
                />
            }
            {type === 'schedule' &&
                <Autocomplete
                    fullWidth
                    value={schedule}
                    onChange={(_, newValue) => setSchedule(newValue ?? defaultSchedule)}
                    options={allSchedules()}
                    groupBy={schedule => getScheduleGroup(schedule)}
                    getOptionLabel={schedule => scheduleToString(schedule)}
                    renderInput={(params) => (
                        <TextField
                            {...params}
                            {...commonTextFieldProperties}
                            label='Schedule'
                        />
                    )}
                />
            }
            <TextInput
                label='Payment Method'
                value={method}
                setValue={setMethod}
                disabled={isNavigating}
                options={paymentMethodOptions}
            />
            <TextInput
                label='Author'
                value={author}
                setValue={setAuthor}
                disabled={isNavigating}
                options={authorOptions}
            />
            <Autocomplete
                multiple
                freeSolo
                fullWidth
                value={tags}
                onChange={(_, newValues) => setTags(newValues)}
                options={tagOptions ?? []}
                renderInput={(params) => (
                    <TextField
                        {...params}
                        {...commonTextFieldProperties}
                        label='Tags'
                    />
                )}
            />
            <Stack sx={{marginTop: '20px'}} direction='row' spacing={1}>
                <Button
                    startIcon={<ArrowBackIcon/>}
                    variant='outlined'
                    disabled={isNavigating}
                    onClick={() => navigate(-1)}
                >
                    Back
                </Button>
                <Button
                    endIcon={<SendIcon/>}
                    variant='contained'
                    disabled={isNavigating || anyError}
                    onClick={submitExpense}
                >
                    Submit
                </Button>
            </Stack>
        </Box>
    );
}

export interface ExpenseEditorParameters<E extends BaseExpense> {
    endpoint: ModifyingEndpoint<E>;
    initialExpense: E;
}

export function ExpenseEditor({endpoint, initialExpense}: ExpenseEditorParameters<Expense>) {
    return <BaseExpenseEditor type='expense' endpoint={endpoint} initialExpense={initialExpense}/>
}

export function ExpenseTemplateEditor({endpoint, initialExpense}: ExpenseEditorParameters<ExpenseTemplate>) {
    return <BaseExpenseEditor type='template' endpoint={endpoint} initialExpense={initialExpense}/>
}

export function ScheduledExpenseEditor({endpoint, initialExpense}: ExpenseEditorParameters<ScheduledExpense>) {
    return <BaseExpenseEditor type='schedule' endpoint={endpoint} initialExpense={initialExpense}/>
}
