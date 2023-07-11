import {Expense} from "../model/expense";
import {useState} from "react";
import {Box, Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Stack, Typography} from "@mui/material";
import {NamedObject} from "../model/common";
import {DateStructPicker, NumberInput, TextInput} from "./Editor";
import AddIcon from "@mui/icons-material/Add";

function namedObject(value: string): NamedObject {
    return {
        name: value
    };
}

export function ExpenseEditor({initialExpense}: {initialExpense: Expense}) {
    const [expense, setExpense] = useState(initialExpense);
    const [currentTag, setCurrentTag] = useState('');
    const [openAddTag, setOpenAddTag] = useState(false);

    // TODO to currency string?
    const [amount, setAmount] = useState(initialExpense.amount.amount.toString());

    const isNewTag = expense.tags.find(tag => tag.name === currentTag) === undefined;
    const canAddTag = currentTag !== '' && isNewTag;

    function validateMandatory(value: string): string | undefined {
        return value === '' ? 'This field is mandatory' : undefined;
    }

    function set<K extends keyof Expense>(key: K, value: Expense[K]) {
        const copy = {...expense};
        copy[key] = value;
        setExpense(copy);
    }

    function validateTag(tag: string): string | undefined {
        return isNewTag ? undefined : 'This tag was already used';
    }

    function addTag() {
        if (!canAddTag) {
            return;
        }
        const newTags = [...expense.tags];
        newTags.push(namedObject(currentTag));
        setCurrentTag('');
        set('tags', newTags);
    }

    function deleteTag(tag: NamedObject) {
        const newTags = [...expense.tags].filter(t => t.name !== tag.name);
        set('tags', newTags);
    }

    function closeAddTagDialog() {
        setOpenAddTag(false);
    }

    return (
        <Box component='form'>
            <TextInput
                label='Name'
                value={expense.name.name}
                setValue={value => set('name', namedObject(value))}
                validate={validateMandatory}
            />
            <NumberInput
                label='Amount'
                value={amount}
                setValue={setAmount}
            />
            <DateStructPicker
                label='Date'
                value={expense.date}
                setValue={value => set('date', value)}
            />
            <TextInput
                label='Payment Method'
                value={expense.method.name}
                setValue={value => set('method', namedObject(value))}
            />
            <TextInput
                label='Author'
                value={expense.author.name}
                setValue={value => set('author', namedObject(value))}
            />
            <Typography 
                variant='body1'
                sx={{marginTop: '10px', marginBottom: '10px'}}
            >
                Tags
            </Typography>
            <Stack direction='row' spacing={1}>
                {expense.tags.map(tag => (
                    <Chip key={tag.name} label={tag.name} onDelete={() => deleteTag(tag)} variant='outlined'/>
                ))}
                <IconButton onClick={() => setOpenAddTag(true)}>
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
                        validate={validateTag}
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
        </Box>
    );
}