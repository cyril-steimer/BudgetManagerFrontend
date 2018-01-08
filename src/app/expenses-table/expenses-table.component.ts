import { Component, OnInit, Input } from '@angular/core';
import { Expense, Sort, SubList } from '../model';
import { Router } from '@angular/router';
import { Observable } from 'rxjs/Observable';

@Component({
  selector: 'app-expenses-table',
  templateUrl: './expenses-table.component.html',
  styleUrls: ['./expenses-table.component.css']
})
export class ExpensesTableComponent implements OnInit {

  @Input() expenses: Expense[] = []
  @Input() beforeEdit: BeforeEdit
  @Input() sorter: ExpenseSorter

  private directions: SortDirection[] = [
    { dir: "asc" },
    { dir: "desc" }
  ]

  private fields: SortField[] = [
    { field: "name" },
    { field: "category" },
    { field: "date" },
    { field: "amount" }
  ]

  constructor(private router: Router) { }

  ngOnInit() {
  }

  edit(expense: Expense) {
    if (this.beforeEdit) {
      this.beforeEdit.beforeEdit(expense)
    }
    this.router.navigate(["edit", "expense", expense.id])
  }

  sort(event: any) {
    if (this.sorter != null) {
      let field = this.sortField(event.active)
      let dir = this.sortDirection(event.direction)
      if (dir == null) {
        this.sorter.removeSort()
      } else {
        this.sorter.sort(field, dir)
      }
    }
  }

  private sortField(name: string): SortField {
    for (let field of this.fields) {
      if (field.field === name) {
        return field
      }
    }
    return null
  }

  private sortDirection(name: string): SortDirection {
    for (let dir of this.directions) {
      if (dir.dir === name) {
        return dir
      }
    }
    return null
  }
}

export interface BeforeEdit {
  beforeEdit(expense: Expense)
}

export class SortDirection {
  dir: "asc" | "desc"
}

export class SortField {
  field: "date" | "amount" | "name" | "category"
}

export interface ExpenseSorter {

  sort(field: SortField, dir: SortDirection)
  removeSort()
}