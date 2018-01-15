import { Budget } from "./model";

export enum BudgetPeriod {
  MONTHLY = "monthly",
  YEARLY = "yearly"
}

export interface BudgetPeriodSwitch<A, R> {

  caseMonthly(arg: A): R

  caseYearly(arg: A): R
}

export class BudgetPeriodSwitcher<A, R> {
  constructor(private mySwitch: BudgetPeriodSwitch<A, R>) {}

  switch(period: BudgetPeriod, arg: A): R {
    if (period == BudgetPeriod.MONTHLY) {
      return this.mySwitch.caseMonthly(arg)
    } else if (period == BudgetPeriod.YEARLY) {
      return this.mySwitch.caseYearly(arg)
    }
    throw Error("The budget period is invalid")
  }
}

class BudgetToYearly implements BudgetPeriodSwitch<Budget, Budget> {

  caseMonthly(arg: Budget): Budget {
    arg.amount.amount = arg.amount.amount * 12
    return arg
  }

  caseYearly(arg: Budget): Budget {
    return arg
  }
}

class YearlyToPeriod implements BudgetPeriodSwitch<Budget, Budget> {

  caseMonthly(arg: Budget): Budget {
    arg.amount.amount = arg.amount.amount / 12
    arg.period = BudgetPeriod.MONTHLY
    return arg
  }

  caseYearly(arg: Budget): Budget {
    arg.period = BudgetPeriod.YEARLY
    return arg
  }
}

export class BudgetConverter {

  convert(budget: Budget, period: BudgetPeriod): Budget {
    let yearly = new BudgetPeriodSwitcher(new BudgetToYearly())
      .switch(budget.period, budget)
    return new BudgetPeriodSwitcher(new YearlyToPeriod())
      .switch(period, yearly)
  }
}