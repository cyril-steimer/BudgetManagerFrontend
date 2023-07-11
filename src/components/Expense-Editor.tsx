import {Expense} from "../model/expense";
import {useEffect, useState} from "react";
import {Autocomplete, Box, Button, Stack, TextField} from "@mui/material";
import {NamedObject} from "../model/common";
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

interface ExpenseEditorParameters {
    endpoint: ModifyingEndpoint<Expense>;
    initialExpense: Expense;
}

function loadAutocompleteData(loaderFunc: () => Promise<string[]>, setData: (values: string[]) => void) {
    loaderFunc().then(promise => setData(promise)); // TODO Error handling
}

export function ExpenseEditor({endpoint, initialExpense}: ExpenseEditorParameters) {

    const [name, setName] = useState(initialExpense.name.name);
    const [amount, setAmount] = useState(initialExpense.amount.amount.toFixed(2));
    const [category, setCategory] = useState(initialExpense.category.name);
    const [date, setDate] = useState(initialExpense.date);
    const [method, setMethod] = useState(initialExpense.method.name);
    const [author, setAuthor] = useState(initialExpense.author.name);
    const [tags, setTags] = useState(initialExpense.tags.map(t => t.name));

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
        const expense: Expense = {
            id: initialExpense.id,
            name: namedObject(name),
            amount: { amount: parseFloat(amount) },
            category: namedObject(category),
            date: date,
            method: namedObject(method),
            author: namedObject(author),
            tags: tags.map(tag => namedObject(tag))
        };
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
            <DateStructPicker
                label='Date'
                value={date}
                setValue={setDate}
                disabled={isNavigating}
            />
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