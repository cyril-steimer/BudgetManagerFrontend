export class QueryUtil {
  
  static monthQuery(month: Date) {
    let start = month
    let end = new Date(start.getFullYear(), start.getMonth() + 1)
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