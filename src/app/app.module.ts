import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';


import { AppComponent } from './app.component';
import { ExpensesComponent } from './expenses/expenses.component';
import { ExpenseService } from './expense.service';
import { MatTableModule } from '@angular/material';


@NgModule({
  declarations: [
    AppComponent,
    ExpensesComponent
  ],
  imports: [
    BrowserModule,
    MatTableModule
  ],
  providers: [
    ExpenseService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
