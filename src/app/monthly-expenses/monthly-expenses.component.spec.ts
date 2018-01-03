import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MonthlyExpensesComponent } from './monthly-expenses.component';

describe('MonthlyExpensesComponent', () => {
  let component: MonthlyExpensesComponent;
  let fixture: ComponentFixture<MonthlyExpensesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MonthlyExpensesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MonthlyExpensesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
