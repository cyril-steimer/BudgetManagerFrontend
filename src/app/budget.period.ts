import { Budget } from "./model";

export enum BudgetPeriod {
  MONTHLY = "monthly",
  YEARLY = "yearly"
}

export interface BudgetPeriodSwitch<A, R> {

  caseMonthly(arg: A): R

  caseYearly(arg: A): R
}

export class BudgetPeriodSwitcher {
  constructor(private period: BudgetPeriod) {}

  switch<A, R>(mySwitch: BudgetPeriodSwitch<A, R>, arg: A): R {
    if (this.period == BudgetPeriod.MONTHLY) {
      return mySwitch.caseMonthly(arg)
    } else if (this.period == BudgetPeriod.YEARLY) {
      return mySwitch.caseYearly(arg)
    }
    throw Error("The budget period is invalid")
  }

  getPeriod() {
    return this.period
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
    let yearly = new BudgetPeriodSwitcher(budget.period)
      .switch(new BudgetToYearly(), budget)
    return new BudgetPeriodSwitcher(period)
      .switch(new YearlyToPeriod(), yearly)
  }
}