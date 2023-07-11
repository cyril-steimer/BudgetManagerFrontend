import {DatePicker} from '@mui/x-date-pickers/DatePicker';
import {DateStruct, dateStructToDayJsObject, dayJsObjectToDateStruct} from "../model/common";
import dayjs from  "dayjs";
import {TextField} from '@mui/material';

export interface DateStructPickerArguments {
    label: string;
    value: DateStruct;
    setValue: (newValue: DateStruct) => void;
}

export function DateStructPicker({label, value, setValue}: DateStructPickerArguments) {
    const now = dayjs();

    return (
        <DatePicker
            slotProps={{textField: { fullWidth: true, margin: 'normal' } }}
            label={label}
            value={dateStructToDayJsObject(value)}
            onChange={newValue => setValue(dayJsObjectToDateStruct(newValue ?? now))}
        />
    );
}

export interface BasicInputArguments {
    label: string;
    value: string;
    setValue: (newValue: string) => void;
}

export type NumberInputArguments = BasicInputArguments;

const numberRegex = /^[0-9]+(\.[0-9]+)?$/;

export function NumberInput({label, value, setValue}: NumberInputArguments) {
    const isValid = numberRegex.test(value);
    const helperText = isValid ? undefined : 'Please enter a positive number';

    return (
        <TextField
            fullWidth
            label={label}
            value={value}
            onChange={event => setValue(event.target.value)}
            margin='normal'
            error={!isValid}
            helperText={helperText}
        />
    );
}

export interface TextInputArguments extends BasicInputArguments {
    validate?: (value: string) => string | undefined;
}

export function TextInput({label, value, setValue, validate}: TextInputArguments) {
    const helperText = validate === undefined ? undefined : validate(value);
    const hasError = helperText !== undefined;

    return (
        <TextField
            fullWidth
            label={label}
            value={value}
            onChange={event => setValue(event.target.value)}
            margin='normal'
            error={hasError}
            helperText={helperText}
        />
    );
}
