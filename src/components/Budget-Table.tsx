import {useState} from "react";
import {BudgetInPeriodWithExpenses} from "../model/budget";
import {compareAmount, compareNamedObject, compareNumber} from "../model/common";
import {sumAmount, sumExpenses, sumValues} from "../model/expense";
import {CurrencyCell, EditButton} from "./Common";
import {ColumnSettings, DataTable, TableItem} from "./Data-Table";
import {Dialog, DialogContent, DialogTitle} from "@mui/material";
import {ExpensesTable} from "./Expenses-Table";
import {ExpenseEndpoint} from "../endpoints/expense-endpoints";
import {BudgetEndpoint} from "../endpoints/budget-endpoint";

class BudgetInPeriodTableItem implements TableItem {
    readonly id: string;
    readonly total: number;

    constructor(readonly budget: BudgetInPeriodWithExpenses) {
        this.id = budget.budget.category.name;
        this.total = sumExpenses(budget.expenses);
    }
}

export interface BudgetTableParameters {
    budgets: BudgetInPeriodWithExpenses[];
}

export function BudgetTable({budgets}: BudgetTableParameters) {
    const tableItems = budgets.map(budget => new BudgetInPeriodTableItem(budget));

    const name = ColumnSettings.of<BudgetInPeriodTableItem, 'budget'>('budget', {
        name: 'Category',
        render: budget => budget.budget.category.name,
        compare: (a, b) => compareNamedObject(a.budget.category, b.budget.category),
        renderSummary: _ => <b>Total</b>
    });
    const spent = ColumnSettings.of<BudgetInPeriodTableItem, 'total'>('total', {
        name: 'Spent',
        render: total => <CurrencyCell value={total}/>,
        compare: compareNumber,
        renderSummary: values => <CurrencyCell value={sumValues(values)}/>
    });
    const budget = ColumnSettings.of<BudgetInPeriodTableItem, 'budget'>('budget', {
        name: 'Budget',
        render: budget => <CurrencyCell value={budget.budget.amount.amount}/>,
        compare: (a, b) => compareAmount(a.budget.amount, b.budget.amount),
        renderSummary: budgets => <CurrencyCell value={sumAmount(budgets.map(b => b.budget.amount))}/>
    });
    const edit = ColumnSettings.of<BudgetInPeriodTableItem, 'budget'>('budget', {
        name: '',
        render: budget => <EditButton endpoint={endpoint} id={budget.budget.category.name}/>
    });

    const [openDetailsDialog, setOpenDetailsDialog] = useState(false);
    const [budgetForDetails, setBudgetForDetails] = useState<BudgetInPeriodWithExpenses | undefined>();

    const endpoint = new BudgetEndpoint();

    return (
        <div>
            <DataTable
                values={tableItems}
                columns={[name, spent, budget, edit]}
                initialSortColumn={budget}
                initialSortDirection='desc'
                onClickCell={(row, column) => {
                    if (column !== edit) {
                        setBudgetForDetails(row.budget);
                        setOpenDetailsDialog(true);
                    }
                }}
                addSummaryRow
            />
            <Dialog
                open={openDetailsDialog}
                onClose={() => setOpenDetailsDialog(false)}
                maxWidth='xl'
            >
                <DialogTitle>
                    {budgetForDetails?.budget.category.name}
                </DialogTitle>
                <DialogContent>
                    <ExpensesTable
                        endpoint={new ExpenseEndpoint()}
                        expenses={budgetForDetails?.expenses ?? []}
                    />
                </DialogContent>
            </Dialog>
        </div>
    );
}