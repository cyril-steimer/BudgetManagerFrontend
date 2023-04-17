import {Expense} from '../model/expense';
import {ColumnSettings, ColumnSettingsInterface} from '../components/Table';

export function expenseColumnSettings<K extends keyof Expense>(key: K, settings: ColumnSettingsInterface<Expense, K>): ColumnSettings<Expense> {
    return ColumnSettings.of(key, settings);
}
