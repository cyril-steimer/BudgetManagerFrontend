import { Component, OnInit, Input } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-month-header',
  templateUrl: './month-header.component.html',
  styleUrls: ['./month-header.component.css']
})
export class MonthHeaderComponent implements OnInit {

  nextMonth: Date
  @Input() month: Date
  prevMonth: Date

  @Input() urlPrefix: string

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    this.setMonth(this.month)
    this.route.params.subscribe(params => this.updateMonth(params))
  }

  private updateMonth(params: any) {
    let year = +params.year
    let month = +params.month
    this.setMonth(new Date(year, month))
  }

  private setMonth(date: Date) {
    let year = date.getFullYear()
    let month = date.getMonth()
    this.month = date
    this.nextMonth = new Date(+year, +month + 1)
    this.prevMonth = new Date(+year, +month - 1)
  }
}
