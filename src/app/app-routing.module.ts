import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router'
import { NewExpenseComponent } from './new-expense/new-expense.component';
import { ExpensesComponent } from './expenses/expenses.component';
import { MonthlyExpensesComponent } from './monthly-expenses/monthly-expenses.component';

const routes: Routes = [
  { path: 'add', component: NewExpenseComponent },
  { path: '', component: ExpensesComponent },
  { path: 'year/:year/month/:month', component: MonthlyExpensesComponent }
]

@NgModule({
  imports: [
    RouterModule.forRoot(routes)
  ],
  exports: [ RouterModule ]
})
export class AppRoutingModule { }
