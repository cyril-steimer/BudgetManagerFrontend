import {DatePicker} from '@mui/x-date-pickers/DatePicker';
import {DateStruct, dateStructToDayJsObject, dayJsObjectToDateStruct} from "../model/common";
import dayjs from  "dayjs";
import {InputAdornment, TextField} from '@mui/material';
import {useContext} from 'react';
import {CurrencyContext} from '../context/contexts';

export interface DateStructPickerParameters {
    label: string;
    value: DateStruct;
    setValue: (newValue: DateStruct) => void;
    disabled?: boolean;
}

export function DateStructPicker({label, value, setValue, disabled}: DateStructPickerParameters) {
    const now = dayjs();

    return (
        <DatePicker
            slotProps={{textField: { fullWidth: true, margin: 'normal' } }}
            label={label}
            value={dateStructToDayJsObject(value)}
            onChange={newValue => setValue(dayJsObjectToDateStruct(newValue ?? now))}
            disabled={disabled}
        />
    );
}

export interface BasicInputParameters {
    label: string;
    value: string;
    setValue: (newValue: string) => void;
    disabled?: boolean;
}

export interface CurrencyAmountInputParameters extends BasicInputParameters {
    setValid?: (valid: boolean) => void;
}

const numberRegex = /^[0-9]+(\.[0-9]+)?$/;

export function CurrencyAmountInput({label, value, setValue, disabled, setValid}: CurrencyAmountInputParameters) {
    const isValid = numberRegex.test(value);
    const helperText = isValid ? undefined : 'Please enter a positive number';
    setValid?.(isValid);

    const currency = useContext(CurrencyContext);

    return (
        <TextField
            fullWidth
            label={label}
            value={value}
            onChange={event => setValue(event.target.value)}
            margin='normal'
            error={!isValid}
            helperText={helperText}
            disabled={disabled}
            InputProps={{
                startAdornment: <InputAdornment position='start'>{currency}</InputAdornment>
            }}
        />
    );
}

export interface TextInputParameters extends BasicInputParameters {
    errorText?: string;
}

export function TextInput({label, value, setValue, disabled, errorText}: TextInputParameters) {
    const hasError = errorText !== undefined;

    return (
        <TextField
            fullWidth
            label={label}
            value={value}
            onChange={event => setValue(event.target.value)}
            margin='normal'
            error={hasError}
            helperText={errorText}
            disabled={disabled}
        />
    );
}