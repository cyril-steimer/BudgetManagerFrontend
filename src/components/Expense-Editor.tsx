import {BaseExpense, Expense, ExpenseTemplate, Schedule, ScheduledExpense, allSchedules, isMonthlySchedule, isWeeklySchedule, scheduleToString} from "../model/expense";
import {useEffect, useState} from "react";
import {Autocomplete, Box, TextField} from "@mui/material";
import {compareDateStruct, dateStructNow, namedObject} from "../model/common";
import {DateStructPicker, CurrencyAmountInput, TextInput, commonTextFieldProperties, Dropdown, EditButtons, isValidAmount} from "./Editor";
import {useIsNavigating} from "../hooks/hooks";
import {useNavigate} from "react-router-dom";
import {EditorMode, ModifyingEndpoint} from "../endpoints/endpoint";
import {submitData} from "../routes/Endpoint-Routes";
import {getAllAuthors, getAllBudgetCategories, getAllPaymentMethods, getAllTags} from "../endpoints/helpers";

function loadAutocompleteData(loaderFunc: () => Promise<string[]>, setData: (values: string[]) => void) {
    loaderFunc().then(promise => setData(promise.sort())); // TODO Error handling
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
    initialExpense: InitialExpense;
    type: T;
    mode: EditorMode;
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

function BaseExpenseEditor<T extends ExpenseSelector>({type, initialExpense, endpoint, mode}: BaseExpenseEditorParameters<T>) {

    const [name, setName] = useState(initialExpense?.name?.name ?? '');
    const [amount, setAmount] = useState((initialExpense?.amount?.amount ?? 0).toFixed(2));
    const [category, setCategory] = useState(initialExpense?.category?.name ?? '');
    const [date, setDate] = useState(initialExpense?.date ?? dateStructNow());
    const [method, setMethod] = useState(initialExpense?.method?.name ?? '');
    const [author, setAuthor] = useState(initialExpense?.author?.name ?? '');
    const [tags, setTags] = useState((initialExpense?.tags ?? []).map(t => t.name));
    const [startDate, setStartDate] = useState(initialExpense?.startDate ?? dateStructNow());
    const [endDate, setEndDate] = useState(initialExpense?.endDate);
    const [schedule, setSchedule] = useState(initialExpense?.schedule ?? defaultSchedule);

    const [categoryOptionsFromBackend, setCategoryOptionsFromBackend] = useState<string[]>([]);
    const [authorOptions, setAuthorOptions] = useState<string[]>();
    const [paymentMethodOptions, setPaymentMethodOptions] = useState<string[]>();
    const [tagOptions, setTagOptions] = useState<string[]>();

    let categoryOptions = categoryOptionsFromBackend;
    if (categoryOptions.indexOf(category) < 0 && category !== '') {
        // Ensure the active category can always be selected
        categoryOptions = [...categoryOptions, category].sort();
    }

    const [amountValid, setAmountValid] = useState(isValidAmount(amount));

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
        await submitData(endpoint, mode, expense, setSubmitting);
        navigate(-1); // Go back to the previous page
    }

    useEffect(() => loadAutocompleteData(getAllBudgetCategories, setCategoryOptionsFromBackend), []);
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
                setValue={(value, valid) => {
                    setAmount(value);
                    setAmountValid(valid);
                }}
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
                    isOptionEqualToValue={(v1, v2) => JSON.stringify(v1) === JSON.stringify(v2)}
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
            <EditButtons
                mode={mode}
                endpoint={endpoint}
                id={initialExpense.id}
                hasError={anyError}
                isNavigating={isNavigating}
                setSubmitting={setSubmitting}
                onSubmit={submitExpense}
            />
        </Box>
    );
}

/**
 * The `InitialExpense` type allows clients to specify an expense partially for the editor.
 * This has two benefits:
 * - Clients only need to specify what they really care about. Default values will be used for everything else.
 * - It allows for conversion between different expense types, e.g. pre-filling all the fields for an expense from a template (except the date, which is missing in the template).
 */
export type InitialExpense = Partial<Omit<FullExpense, 'id'>> & Pick<Expense, 'id'>;

export interface ExpenseEditorParameters<E extends BaseExpense> {
    endpoint: ModifyingEndpoint<E>;
    initialExpense: InitialExpense;
    mode: EditorMode;
}

export function ExpenseEditor({endpoint, initialExpense, mode}: ExpenseEditorParameters<Expense>) {
    return <BaseExpenseEditor type='expense' endpoint={endpoint} initialExpense={initialExpense} mode={mode}/>
}

export function ExpenseTemplateEditor({endpoint, initialExpense, mode}: ExpenseEditorParameters<ExpenseTemplate>) {
    return <BaseExpenseEditor type='template' endpoint={endpoint} initialExpense={initialExpense} mode={mode}/>
}

export function ScheduledExpenseEditor({endpoint, initialExpense, mode}: ExpenseEditorParameters<ScheduledExpense>) {
    return <BaseExpenseEditor type='schedule' endpoint={endpoint} initialExpense={initialExpense} mode={mode}/>
}
