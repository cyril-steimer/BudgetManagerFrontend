import {Expense} from "../model/expense";
import {useState} from "react";
import {Box, Chip, IconButton, InputAdornment, Stack, TextField} from "@mui/material";
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

    function set<K extends keyof Expense>(key: K, value: Expense[K]) {
        const copy = {...expense};
        copy[key] = value;
        setExpense(copy);
    }

    function addTag() {
        if (currentTag === '') {
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
            <TextField
                fullWidth
                label='Tags'
                value={currentTag}
                onChange={event => setCurrentTag(event.target.value)}
                InputProps={{
                    endAdornment: (
                        <InputAdornment position='end'>
                            <IconButton onClick={addTag}>
                                <AddIcon/>
                            </IconButton>
                        </InputAdornment>
                    )
                }}
                margin='normal'
            >
            </TextField>
            <Stack direction='row' spacing={1}>
                {expense.tags.map(tag => (
                    <Chip label={tag.name} onDelete={() => deleteTag(tag)} variant='outlined'/>
                ))}
            </Stack>
        </Box>
    );
}