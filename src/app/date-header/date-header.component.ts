import { Component, OnInit, Input } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-date-header',
  templateUrl: './date-header.component.html',
  styleUrls: ['./date-header.component.css']
})
export class DateHeaderComponent implements OnInit {

  nextDate: Date
  @Input() date: Date
  prevDate: Date

  @Input() urlPrefix: string

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    this.setMonth(this.date)
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
    this.date = date
    this.nextDate = new Date(+year, +month + 1)
    this.prevDate = new Date(+year, +month - 1)
  }
}
