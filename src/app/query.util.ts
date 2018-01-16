import { BudgetPeriodSwitcher, BudgetPeriodSwitch } from "./budget.period";

export class PeriodQuery implements BudgetPeriodSwitch<Date, {}> {
 
  caseMonthly(arg: Date): {} {
    return QueryUtil.monthQuery(arg)
  }

  caseYearly(arg: Date): {} {
    return QueryUtil.yearQuery(arg)
  }
}

private class QueryUtil {

  static yearQuery(year: Date) {
    let start = new Date(year.getFullYear(), 0).getTime()
    let end = new Date(year.getFullYear() + 1, 0).getTime()
    return QueryUtil.betweenDateQuery(start, end)
  }
  
  static monthQuery(month: Date) {
    let start = new Date(month.getFullYear(), month.getMonth()).getTime()
    let end = new Date(month.getFullYear(), month.getMonth() + 1).getTime()
    return QueryUtil.betweenDateQuery(start, end)
  }

  private static betweenDateQuery(start: number, end: number) {
    return {and: [
      {
        date: {
          date: start,
          comparison: ">="
        }
      },
      {
        date: {
          date: end,
          comparison: "<"
        }
      }
    ]
  }
}