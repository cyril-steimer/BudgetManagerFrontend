import { Component, OnInit, Input } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BudgetPeriodSwitch, BudgetPeriod, BudgetPeriodSwitcher } from '../budget.period';
import { dashCaseToCamelCase } from '@angular/compiler/src/util';

@Component({
  selector: 'app-date-header',
  templateUrl: './date-header.component.html',
  styleUrls: ['./date-header.component.css']
})
export class DateHeaderComponent implements OnInit {

  @Input() date: Date
  @Input() switcher: BudgetPeriodSwitcher
  @Input() urlPrefix: string

  nextDateLink: DateLink
  dateLink: DateLink
  prevDateLink: DateLink
  
  upDateLink: DateLink

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    this.update(this.date)
    this.route.params.subscribe(params => this.updateDate(params))
  }

  private updateDate(params: any) {
    let date = this.switcher.switch(new DateExtractor(), params)
    this.update(date)
  }

  private update(date: Date) {
    this.dateLink = DateLink.create(this.switcher, date)

    let nextDate = this.switcher.switch(new NextDate(), date)
    this.nextDateLink = DateLink.create(this.switcher, nextDate)

    let prevDate = this.switcher.switch(new PreviousDate(), date)
    this.prevDateLink = DateLink.create(this.switcher, prevDate)

    this.upDateLink = this.switcher.switch(new UpDateLink(), date)
  }
}


class DateLink {
  label: string
  urlSuffix: string

  static create(switcher: BudgetPeriodSwitcher, date: Date) {
    return switcher.switch(new DateLinkFactory(), date)
  }
}

class UpDateLink implements BudgetPeriodSwitch<Date, DateLink> {

  caseMonthly(arg: Date): DateLink {
    let year = new Date(arg.getFullYear(), 0)
    return DateLink.create(new BudgetPeriodSwitcher(BudgetPeriod.YEARLY), year)
  }

  caseYearly(arg: Date): DateLink {
    return null //There is no coarser view than 'yearly'
  }
}

class DateLinkFactory implements BudgetPeriodSwitch<Date, DateLink> {

  caseMonthly(arg: Date): DateLink {
    return {
      label: `${arg.getMonthName()} ${arg.getFullYear()}`,
      urlSuffix: `year/${arg.getFullYear()}/month/${arg.getMonth()}`
    }
  }

  caseYearly(arg: Date): DateLink {
    return {
      label: `${arg.getFullYear()}`,
      urlSuffix: `year/${arg.getFullYear()}`
    }
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
