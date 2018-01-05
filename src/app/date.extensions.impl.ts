const monthNames = ["January", "February", "March", "April", "May", "June", "July",
                    "August", "September", "October", "November", "December"]

Date.prototype.getMonthName = function(this: Date) {
  return monthNames[this.getMonth()]
}

Date.prototype.toJSON = function(this: Date) {
  function addZ(n) {
    return (n<10? '0' : '') + n;
  }
  return this.getFullYear() + '-' + 
        addZ(this.getMonth() + 1) + '-' + 
        addZ(this.getDate());
}