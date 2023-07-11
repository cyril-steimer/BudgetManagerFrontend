import {Expense} from "../model/expense";
import {useState} from "react";
import {Box, Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Stack, TextField, Typography} from "@mui/material";
import {NamedObject} from "../model/common";
import {DateStructPicker} from "./Editor";
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

    const canAddTag = currentTag !== '' && expense.tags.find(tag => tag.name === currentTag) === undefined;

    function set<K extends keyof Expense>(key: K, value: Expense[K]) {
        const copy = {...expense};
        copy[key] = value;
        setExpense(copy);
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
            <TextField
                fullWidth
                label='Name'
                value={expense.name.name}
                onChange={event => set('name', namedObject(event.target.value))}
                margin='normal'
            />
            <TextField
                fullWidth
                label='Amount'
                value={expense.amount.amount}
                onChange={event => set('amount', { amount: parseFloat(event.target.value) })}
                margin='normal'
            />
            <DateStructPicker
                label='Date'
                value={expense.date}
                setValue={value => set('date', value)}
            />
            <TextField
                fullWidth
                label='Payment Method'
                value={expense.method.name}
                onChange={event => set('method', namedObject(event.target.value))}
                margin='normal'
            />
            <TextField
                fullWidth
                label='Author'
                value={expense.author.name}
                onChange={event => set('author', namedObject(event.target.value))}
                margin='normal'
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
                    <TextField
                        fullWidth
                        variant='standard'
                        label='Tag'
                        value={currentTag}
                        onChange={event => setCurrentTag(event.target.value)}
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