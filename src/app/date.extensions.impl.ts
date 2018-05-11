const monthNames = ["January", "February", "March", "April", "May", "June", "July",
                    "August", "September", "October", "November", "December"]

Date.prototype.getMonthName = function(this: Date) {
  return monthNames[this.getMonth()]
}

Date.prototype.max = function(this: Date, other: Date) {
  return this.getTime() > other.getTime() ? this : other;
}

Date.prototype.min = function(this: Date, other: Date) {
  return this.getTime() > other.getTime() ? other : this;
}