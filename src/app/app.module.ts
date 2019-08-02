import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { ExpensesComponent } from './expenses/expenses.component';
import { ExpenseServiceProvider, ExpenseService, TemplateService, ExpenseResolverService } from './expense.service';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppRoutingModule } from './/app-routing.module';
import './date.extensions.impl';
import { BudgetComponent } from './budget/budget.component';
import { BudgetService } from './budget.service';
import { ExpensesTableComponent } from './expenses-table/expenses-table.component';
import { EditExpenseComponent } from './edit-expense/edit-expense.component'
import 'chart.js'
import { ChartsModule } from 'ng2-charts';
import { DateHeaderComponent } from './date-header/date-header.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { DashboardComponent } from './dashboard/dashboard.component';
import { EditBudgetComponent } from './edit-budget/edit-budget.component';
import { MinValidatorDirective } from './validators.directive';
import { ReportComponent } from './report/report.component';
import { ImportExportComponent } from './import-export/import-export.component';
import { ImportExportService } from './import-export.service';
import { AutocompleteService } from './autocomplete.service';

@NgModule({
  declarations: [
    AppComponent,
    ExpensesComponent,
    BudgetComponent,
    DateHeaderComponent,
    ExpensesTableComponent,
    EditExpenseComponent,
    DashboardComponent,
    EditBudgetComponent,
    MinValidatorDirective,
    ReportComponent,
    ImportExportComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    FormsModule,
    NgbModule.forRoot(),
    ReactiveFormsModule,
    BrowserAnimationsModule,
    ChartsModule,
    AppRoutingModule,
  ],
  providers: [
    ExpenseServiceProvider,
    ExpenseService,
    TemplateService,
    BudgetService,
    ImportExportService,
    AutocompleteService,
    ExpenseResolverService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
