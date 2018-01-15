import { Component, OnInit, Input } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BudgetPeriodSwitch, BudgetPeriod, BudgetPeriodSwitcher } from '../budget.period';

@Component({
  selector: 'app-date-header',
  templateUrl: './date-header.component.html',
  styleUrls: ['./date-header.component.css']
})
export class DateHeaderComponent implements OnInit {

  nextDate: Date
  @Input() date: Date
  prevDate: Date

  @Input() period: BudgetPeriod
  @Input() urlPrefix: string

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    this.setDate(this.date)
    this.route.params.subscribe(params => this.updateDate(params))
  }

  dateToText(date: Date) {
    let switcher = new BudgetPeriodSwitcher(new DateToText())
    return switcher.switch(this.period, date)
  }

  urlSuffix(date: Date) {
    let switcher = new BudgetPeriodSwitcher(new UrlSuffix())
    return switcher.switch(this.period, date)
  }

  private updateDate(params: any) {
    let date = new BudgetPeriodSwitcher(new DateExtractor()).switch(this.period, params)
    this.setDate(date)
  }

  private setDate(date: Date) {
    let year = date.getFullYear()
    let month = date.getMonth()
    this.date = date
    this.nextDate = new BudgetPeriodSwitcher(new NextDate()).switch(this.period, date)
    this.prevDate = new BudgetPeriodSwitcher(new PreviousDate()).switch(this.period, date)
  }
}

class UrlSuffix implements BudgetPeriodSwitch<Date, string> {

  caseMonthly(arg: Date): string {
    return `year/${arg.getFullYear()}/month/${arg.getMonth()}`
  }

  caseYearly(arg: Date): string {
    return `year/${arg.getFullYear()}`
  }
}

class DateToText implements BudgetPeriodSwitch<Date, string> {

  caseMonthly(arg: Date): string {
    return `${arg.getMonthName()} ${arg.getFullYear()}`
  }

  caseYearly(arg: Date): string {
    return `${arg.getFullYear()}`
  }
}

class NextDate implements BudgetPeriodSwitch<Date, Date> {

  caseMonthly(arg: Date): Date {
    return new Date(arg.getFullYear(), arg.getMonth() + 1)
  }

  caseYearly(arg: Date): Date {
    return new Date(arg.getFullYear() + 1, 0)
  }
}

class PreviousDate implements BudgetPeriodSwitch<Date, Date> {

  caseMonthly(arg: Date): Date {
    return new Date(arg.getFullYear(), arg.getMonth() - 1)
  }

  caseYearly(arg: Date): Date {
    return new Date(arg.getFullYear() - 1, 0)
  }
}

export class DateExtractor implements BudgetPeriodSwitch<{[key: string]: any}, Date> {

  caseMonthly(arg: { [key: string]: any; }): Date {
    let year = +arg.year
    let month = +arg.month
    return new Date(year, month)
  }

  caseYearly(arg: { [key: string]: any; }): Date {
    let year = +arg.year
    return new Date(year, 0)
  }
}
