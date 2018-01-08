export class QueryUtil {
  
  static monthQuery(month: Date) {
    let start = month.getTime()
    let end = new Date(month.getFullYear(), month.getMonth() + 1).getTime()
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
}