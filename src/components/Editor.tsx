import {DatePicker, DatePickerProps} from '@mui/x-date-pickers/DatePicker';
import {DateStruct, MonthYear, dateStructToDayJsObject, dayJsObjectToDateStruct, dayJsObjectToMonthYear, monthYearToDayJsObject} from "../model/common";
import dayjs from  "dayjs";
import {Autocomplete, Button, FormControl, FormHelperText, InputAdornment, InputLabel, MenuItem, Select, Stack, TextField, TextFieldProps} from '@mui/material';
import {useContext} from 'react';
import {CurrencyContext} from '../context/contexts';
import {EditorMode, ModifyingEndpoint} from '../endpoints/endpoint';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SendIcon from '@mui/icons-material/Send';
import {useNavigate} from 'react-router-dom';
import {deleteData} from '../routes/Endpoint-Routes';

export type DatePickerValue<D, Required> = Required extends true
    ? D
    : D | undefined;

interface DatePickerParameters<D, Required extends boolean | undefined> {
    label: string;
    value: DatePickerValue<D, Required>;
    required?: Required;
    setValue: (newValue: DatePickerValue<D, Required>) => void;
    minDate?: D;
    maxDate?: D;
    helperText?: string;
    disabled?: boolean;
}

export type DateStructPickerParameters<Required extends boolean | undefined> = DatePickerParameters<DateStruct, Required>;
export type MonthYearPickerParameters<Required extends boolean | undefined> = DatePickerParameters<MonthYear, Required>;

function convertValue<D>(
    value: dayjs.Dayjs | null | undefined,
    required: boolean | undefined,
    converter: (value: dayjs.Dayjs | undefined) => D | undefined
): DatePickerValue<D, false> {
    if (value == null) {
        return required === true ? converter(dayjs()) : undefined;
    }
    return converter(value);
}

interface BasicDatePickerParameters extends DatePickerProps<dayjs.Dayjs> {
    helperText?: string;
}

function BasicDatePicker(parameters: BasicDatePickerParameters) {
    return (
        <DatePicker
            slotProps={{
                textField: {
                    fullWidth: true,
                    margin: 'normal',
                    helperText: parameters.helperText
                }
            }}
            {...parameters}
        />
    )
}

export function MonthYearPicker<Required extends boolean | undefined>({label, value, required, setValue, minDate, maxDate, helperText, disabled}: MonthYearPickerParameters<Required>) {
    return (
        <BasicDatePicker
            helperText={helperText}
            label={label}
            value={monthYearToDayJsObject(value)}
            onChange={newValue => setValue(convertValue(newValue, required, dayJsObjectToMonthYear) as DatePickerValue<MonthYear, Required>)}
            minDate={monthYearToDayJsObject(minDate)}
            maxDate={monthYearToDayJsObject(maxDate)}
            disabled={disabled}
            views={['year', 'month']}
        />
    );
}

export function DateStructPicker<Required extends boolean | undefined>({label, value, required, setValue, minDate, maxDate, helperText, disabled}: DateStructPickerParameters<Required>) {
    return (
        <BasicDatePicker
            helperText={helperText}
            label={label}
            value={dateStructToDayJsObject(value)}
            onChange={newValue => setValue(convertValue(newValue, required, dayJsObjectToDateStruct) as DatePickerValue<DateStruct, Required>)}
            minDate={dateStructToDayJsObject(minDate)}
            maxDate={dateStructToDayJsObject(maxDate)}
            disabled={disabled}
        />
    );
}

export interface BasicInputParameters {
    label: string;
    value: string;
    disabled?: boolean;
}

export interface CurrencyAmountInputParameters extends BasicInputParameters {
    setValue: (newValue: string, valid: boolean) => void;
}

const numberRegex = /^[0-9]+(\.[0-9]+)?$/;

export function CurrencyAmountInput({label, value, setValue, disabled}: CurrencyAmountInputParameters) {
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
            onChange={event => setValue(event.target.value, validate(event.target.value))}
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
    setValue: (newValue: string) => void;
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
    setValue: (newValue: string) => void;
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

export interface EditButtonParameters<T> {
    mode: EditorMode;
    endpoint: ModifyingEndpoint<T>;
    id: string;
    hasError: boolean;
    isNavigating: boolean;
    setSubmitting: (submitting: boolean) => void;
    onSubmit: () => Promise<void>;
}

export function EditButtons<T>({mode, endpoint, id, hasError, isNavigating, setSubmitting, onSubmit}: EditButtonParameters<T>) {
    const navigate = useNavigate();
    
    async function deleteCurrent() {
        await deleteData(endpoint, id, setSubmitting);
        navigate(-1); // Go back to the previous page
    }

    return (
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
                disabled={isNavigating || hasError}
                onClick={onSubmit}
            >
                Submit
            </Button>
            {mode === 'edit' && 
                <Button
                    endIcon={<DeleteIcon/>}
                    variant='outlined'
                    color='error'
                    disabled={isNavigating}
                    onClick={deleteCurrent}
                >
                    Delete
                </Button>
            }
        </Stack>
    );
}