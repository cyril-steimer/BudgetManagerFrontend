import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router'
import { ExpensesComponent } from './expenses/expenses.component';
import { BudgetComponent } from './budget/budget.component';
import { EditExpenseComponent } from './edit-expense/edit-expense.component';

const routes: Routes = [
  { path: 'add', component: EditExpenseComponent },
  { path: 'expenses', component: ExpensesComponent },
  { path: 'expenses/year/:year/month/:month', component: ExpensesComponent },
  { path: 'budget/year/:year/month/:month', component: BudgetComponent },
  { path: 'edit/expense/:id', component: EditExpenseComponent }
]

@NgModule({
  imports: [
    RouterModule.forRoot(routes)
  ],
  exports: [ RouterModule ]
})
export class AppRoutingModule { }
