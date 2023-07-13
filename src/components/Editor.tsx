import {DatePicker} from '@mui/x-date-pickers/DatePicker';
import {DateStruct, dateStructNow, dateStructToDayJsObject, dayJsObjectToDateStruct} from "../model/common";
import dayjs from  "dayjs";
import {Autocomplete, FormControl, FormHelperText, InputAdornment, InputLabel, MenuItem, Select, TextField, TextFieldProps} from '@mui/material';
import {useContext} from 'react';
import {CurrencyContext} from '../context/contexts';

export type DateStructPickerValue<Required> = Required extends true
    ? DateStruct
    : DateStruct | undefined;

export interface DateStructPickerParameters<Required extends boolean | undefined> {
    label: string;
    value: DateStructPickerValue<Required>;
    required?: Required;
    setValue: (newValue: DateStructPickerValue<Required>) => void;
    minDate?: DateStruct;
    maxDate?: DateStruct;
    helperText?: string;
    disabled?: boolean;
}

function convertValue(value: dayjs.Dayjs | null | undefined, required: boolean | undefined): DateStructPickerValue<false> {
    if (value == null) {
        return required === true ? dateStructNow() : undefined;
    }
    return dayJsObjectToDateStruct(value);
}

export function DateStructPicker<Required extends boolean | undefined>({label, value, required, setValue, minDate, maxDate, helperText, disabled}: DateStructPickerParameters<Required>) {
    return (
        <DatePicker
            slotProps={{
                textField: {
                    fullWidth: true,
                    margin: 'normal',
                    helperText: helperText
                }
             }}
            label={label}
            value={dateStructToDayJsObject(value)}
            onChange={newValue => setValue(convertValue(newValue, required) as DateStructPickerValue<Required>)}
            minDate={dateStructToDayJsObject(minDate)}
            maxDate={dateStructToDayJsObject(maxDate)}
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