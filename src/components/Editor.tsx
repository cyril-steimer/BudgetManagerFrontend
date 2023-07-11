import {DatePicker} from '@mui/x-date-pickers/DatePicker';
import {DateStruct, dateStructToDayJsObject, dayJsObjectToDateStruct} from "../model/common";
import dayjs from  "dayjs";

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

