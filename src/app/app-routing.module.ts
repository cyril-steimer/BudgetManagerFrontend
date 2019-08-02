import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router'
import { ExpensesComponent } from './expenses/expenses.component';
import { BudgetComponent } from './budget/budget.component';
import { EditExpenseComponent } from './edit-expense/edit-expense.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { EditBudgetComponent } from './edit-budget/edit-budget.component';
import { ImportExportComponent } from './import-export/import-export.component';

const routes: Routes = [
  { path: '', component: DashboardComponent },
  { path: 'add', component: EditExpenseComponent },
  { path: 'expense/add', component: EditExpenseComponent },
  { path: 'template/add', component: EditExpenseComponent },
  { path: 'budget/add', component: EditBudgetComponent },
  { path: 'expenses', component: ExpensesComponent },
  { path: 'templates', component: ExpensesComponent },
  { path: 'expenses/year/:year', component: ExpensesComponent },
  { path: 'expenses/year/:year/month/:month', component: ExpensesComponent },
  { path: 'expenses/field/:field/:value', component: ExpensesComponent },
  { path: 'templates/field/:field/:value', component: ExpensesComponent },
  { path: 'budget/year/:year', component: BudgetComponent },
  { path: 'budget/year/:year/month/:month', component: BudgetComponent },
  { path: 'edit/expense/:id', component: EditExpenseComponent },
  { path: 'edit/template/:id', component: EditExpenseComponent },
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
