const monthNames = ["January", "February", "March", "April", "May", "June", "July",
                    "August", "September", "October", "November", "December"]

Date.prototype.getMonthName = function(this: Date) {
  return monthNames[this.getMonth()]
}