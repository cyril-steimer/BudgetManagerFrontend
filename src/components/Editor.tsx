import {DatePicker} from '@mui/x-date-pickers/DatePicker';
import {DateStruct, dateStructToDayJsObject, dayJsObjectToDateStruct} from "../model/common";
import dayjs from  "dayjs";
import {Autocomplete, FormControl, FormHelperText, InputAdornment, InputLabel, MenuItem, Select, TextField, TextFieldProps} from '@mui/material';
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
    function validate(val: string): boolean {
        return numberRegex.test(value) && parseFloat(val) > 0;
    }

    const isValid = validate(value);
    const helperText = isValid ? undefined : 'Please enter a positive number';
    const currency = useContext(CurrencyContext);

    return (
        <TextField
            fullWidth
            label={label}
            value={value}
            onChange={event => {
                setValue(event.target.value);
                setValid?.(validate(event.target.value));
            }}
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
    options?: string[];
}

export const commonTextFieldProperties: TextFieldProps = {
    fullWidth: true,
    margin: 'normal'
};

export function TextInput({label, value, setValue, disabled, errorText, options}: TextInputParameters) {
    const hasError = errorText !== undefined;

    const textFieldProperties: TextFieldProps = {
        ...commonTextFieldProperties,
        label: label,
        error: hasError,
        helperText: errorText,
        disabled: disabled
    };

    if (options !== undefined && options.length > 0) {
        return (
            <Autocomplete
                fullWidth
                freeSolo
                autoSelect
                value={value}
                onChange={(_, newValue) => setValue(newValue ?? '')}
                options={options}
                renderInput={(params) => (
                    <TextField
                        {...params}
                        {...textFieldProperties}
                    />
                )}
            />
        );
    }
    return (
        <TextField
            {...textFieldProperties}
            value={value}
            onChange={event => setValue(event.target.value)}
        />
    );
}

export interface DropdownParameters extends BasicInputParameters {
    errorText?: string;
    options: string[];
}

export function Dropdown({label, value, setValue, disabled, errorText, options}: DropdownParameters) {
    const hasError = errorText !== undefined;

    return (
        <FormControl
            fullWidth
            margin='normal'
            error={hasError}
        >
            <InputLabel>{label}</InputLabel>
            <Select
                label={label}
                value={value}
                onChange={event => setValue(event.target.value)}
                disabled={disabled}
            >
                {options.map(option => <MenuItem key={option} value={option}>{option}</MenuItem>)}
            </Select>
            <FormHelperText>{errorText}</FormHelperText>
        </FormControl>
    );
}