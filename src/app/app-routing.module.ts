import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router'
import { ExpensesComponent } from './expenses/expenses.component';
import { BudgetComponent } from './budget/budget.component';
import { EditExpenseComponent } from './edit-expense/edit-expense.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { EditBudgetComponent } from './edit-budget/edit-budget.component';
import { ImportExportComponent } from './import-export/import-export.component';
import { DATA_TEMPLATE, ExpenseResolverService } from './expense.service';

const EXPENSE_RESOLVER = {expense: ExpenseResolverService};

const routes: Routes = [
  { path: '', component: DashboardComponent },
  { path: 'add/expense', component: EditExpenseComponent },
  { path: 'add/template', component: EditExpenseComponent, data: DATA_TEMPLATE },
  { path: 'add/budget', component: EditBudgetComponent },
  { path: 'expenses', component: ExpensesComponent },
  { path: 'templates', component: ExpensesComponent, data: DATA_TEMPLATE },
  { path: 'expenses/year/:year', component: ExpensesComponent },
  { path: 'expenses/year/:year/month/:month', component: ExpensesComponent },
  { path: 'expenses/field/:field/:value', component: ExpensesComponent },
  { path: 'templates/field/:field/:value', component: ExpensesComponent, data: DATA_TEMPLATE },
  { path: 'budget/year/:year', component: BudgetComponent },
  { path: 'budget/year/:year/month/:month', component: BudgetComponent },
  { path: 'edit/expense/:id', component: EditExpenseComponent, resolve: EXPENSE_RESOLVER },
  { path: 'edit/template/:templateid', component: EditExpenseComponent, resolve: EXPENSE_RESOLVER, data: DATA_TEMPLATE },
  { path: 'edit/budget/:id', component: EditBudgetComponent },
  { path: 'importexport', component: ImportExportComponent }
]

@NgModule({
  imports: [
    RouterModule.forRoot(routes)
  ],
  exports: [ RouterModule ]
})
export class AppRoutingModule { }
