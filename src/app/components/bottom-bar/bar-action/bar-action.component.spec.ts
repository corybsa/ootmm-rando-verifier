import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BarActionComponent } from './bar-action.component';

describe('BarActionComponent', () => {
  let component: BarActionComponent;
  let fixture: ComponentFixture<BarActionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BarActionComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BarActionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
