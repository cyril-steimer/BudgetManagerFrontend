import {Expense} from "../model/expense";
import {useState} from "react";
import {Box, Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Stack, Typography} from "@mui/material";
import {NamedObject} from "../model/common";
import {DateStructPicker, CurrencyAmountInput, TextInput} from "./Editor";
import AddIcon from "@mui/icons-material/Add";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SendIcon from '@mui/icons-material/Send';
import {useIsNavigating} from "../hooks/hooks";
import {useNavigate} from "react-router-dom";
import {ModifyingEndpoint} from "../endpoints/endpoint";
import {submitData} from "../routes/Endpoint-Routes";

function namedObject(value: string): NamedObject {
    return {
        name: value
    };
}

interface ExpenseEditorParameters {
    endpoint: ModifyingEndpoint<Expense>;
    initialExpense: Expense;
}


export function ExpenseEditor({endpoint, initialExpense}: ExpenseEditorParameters) {

    const [name, setName] = useState(initialExpense.name.name);
    const [amount, setAmount] = useState(initialExpense.amount.amount.toFixed(2));
    const [date, setDate] = useState(initialExpense.date);
    const [method, setMethod] = useState(initialExpense.method.name);
    const [author, setAuthor] = useState(initialExpense.author.name);
    const [tags, setTags] = useState(initialExpense.tags.map(t => t.name));

    const [amountValid, setAmountValid] = useState(true);

    const [currentTag, setCurrentTag] = useState('');
    const [openAddTag, setOpenAddTag] = useState(false);

    const isNewTag = tags.find(tag => tag === currentTag) === undefined;
    const canAddTag = currentTag !== '' && isNewTag;

    const nameError = name === '' ? 'This field is mandatory' : undefined;
    const tagError = isNewTag ? undefined : 'This tag was already used';
    const anyError = nameError !== undefined || !amountValid;

    const [isSubmitting, setSubmitting] = useState(false);
    const isNavigating = useIsNavigating() || isSubmitting;
    const navigate = useNavigate();

    function addTag() {
        if (!canAddTag) {
            return;
        }
        const newTags = [...tags];
        newTags.push(currentTag);
        setCurrentTag('');
        setTags(newTags);
    }

    function deleteTag(tag: string) {
        const newTags = tags.filter(t => t !== tag);
        setTags(newTags);
    }

    function closeAddTagDialog() {
        setOpenAddTag(false);
    }

    async function submitExpense() {
        const expense: Expense = {
            id: initialExpense.id,
            name: namedObject(name),
            amount: { amount: parseFloat(amount) },
            category: namedObject('not a category!'), // TODO We need to support editing the category!
            date: date,
            method: namedObject(method),
            author: namedObject(author),
            tags: tags.map(tag => namedObject(tag))
        };
        await submitData(endpoint, 'post', expense, setSubmitting);
        navigate(-1); // Go back to the previous page
    }

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
            />
            <TextInput
                label='Author'
                value={author}
                setValue={setAuthor}
                disabled={isNavigating}
            />
            <Typography 
                variant='body1'
                sx={{marginTop: '10px', marginBottom: '10px'}}
            >
                Tags
            </Typography>
            <Stack direction='row' spacing={1}>
                {tags.map(tag => (
                    <Chip key={tag} label={tag} onDelete={() => deleteTag(tag)} variant='outlined' disabled={isNavigating}/>
                ))}
                <IconButton onClick={() => setOpenAddTag(true)} disabled={isNavigating}>
                    <AddIcon/>
                </IconButton>
            </Stack>
            <Dialog open={openAddTag} onClose={closeAddTagDialog}>
                <DialogTitle>Add Tag</DialogTitle>
                <DialogContent>
                    <TextInput
                        label='Tag'
                        value={currentTag}
                        setValue={setCurrentTag}
                        errorText={tagError}
                    />
                </DialogContent>
                <DialogActions>
                    <Button
                        disabled={!canAddTag}
                        onClick={() => {
                            addTag();
                            closeAddTagDialog();
                        }}
                    >
                        Add Tag
                    </Button>
                </DialogActions>
            </Dialog>
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