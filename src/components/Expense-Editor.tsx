import {BaseExpense, Expense, ExpenseTemplate, ScheduledExpense} from "../model/expense";
import {useEffect, useState} from "react";
import {Autocomplete, Box, Button, Stack, TextField} from "@mui/material";
import {NamedObject, dateStructNow} from "../model/common";
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
type ExpenseTypes = TemplateType | ScheduleType | ExpenseType;

type ExpenseImplementation<ExpenseTypes> = ExpenseTypes extends TemplateType
    ? ExpenseTemplate
    : (ExpenseTypes extends ScheduleType ? ScheduledExpense : Expense);

interface BaseExpenseEditorParameters<T extends ExpenseTypes> {
    endpoint: ModifyingEndpoint<ExpenseImplementation<T>>;
    initialExpense: ExpenseImplementation<T>;
    type: T;
}

function test<T extends ExpenseTypes>(type: T, parameters: BaseExpenseEditorParameters<ExpenseTypes>): parameters is BaseExpenseEditorParameters<T> {
    return parameters.type === type;
}

function cast<T extends ExpenseTypes>(type: T, parameters: BaseExpenseEditorParameters<ExpenseTypes>): BaseExpenseEditorParameters<T> | undefined {
    if (test(type, parameters)) {
        return parameters;
    }
    return undefined;
}

type AllExpenses = Expense & ScheduledExpense & ExpenseTemplate;
type ExpenseUnion = {
    [Property in keyof AllExpenses]: AllExpenses[Property]
}

function createExpense<T extends ExpenseTypes>(type: T, values: ExpenseUnion): ExpenseImplementation<T> {
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

function BaseExpenseEditor(parameters: BaseExpenseEditorParameters<ExpenseTypes>) {

    const [name, setName] = useState(parameters.initialExpense.name.name);
    const [amount, setAmount] = useState(parameters.initialExpense.amount.amount.toFixed(2));
    const [category, setCategory] = useState(parameters.initialExpense.category.name);
    const [date, setDate] = useState(cast('expense', parameters)?.initialExpense.date ?? dateStructNow());
    const [method, setMethod] = useState(parameters.initialExpense.method.name);
    const [author, setAuthor] = useState(parameters.initialExpense.author.name);
    const [tags, setTags] = useState(parameters.initialExpense.tags.map(t => t.name));

    const [categoryOptions, setCategoryOptions] = useState<string[]>([]);
    const [authorOptions, setAuthorOptions] = useState<string[]>();
    const [paymentMethodOptions, setPaymentMethodOptions] = useState<string[]>();
    const [tagOptions, setTagOptions] = useState<string[]>();

    const [amountValid, setAmountValid] = useState(true);

    const categoryError = category === '' ? 'This field is mandatory' : undefined;
    const nameError = name === '' ? 'This field is mandatory' : undefined;
    const anyError = categoryError !== undefined || nameError !== undefined || !amountValid;

    const [isSubmitting, setSubmitting] = useState(false);
    const isNavigating = useIsNavigating() || isSubmitting;
    const navigate = useNavigate();

    async function submitExpense() {
        const expense = createExpense(parameters.type, {
            id: parameters.initialExpense.id,
            name: namedObject(name),
            amount: { amount: parseFloat(amount) },
            category: namedObject(category),
            method: namedObject(method),
            author: namedObject(author),
            tags: tags.map(tag => namedObject(tag)),
            // Expense
            date: date,
            // Scheduled Expense
            startDate: dateStructNow(),
            endDate: undefined,
            schedule: {
                dayOfWeek: 'MONDAY'
            }
        });
        await submitData(parameters.endpoint, 'post', expense, setSubmitting);
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
            {parameters.type === 'expense' &&
                <DateStructPicker
                    label='Date'
                    value={date}
                    setValue={setDate}
                    disabled={isNavigating}
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