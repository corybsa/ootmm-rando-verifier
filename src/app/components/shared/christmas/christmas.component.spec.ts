import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChristmasComponent } from './christmas.component';

describe('ChristmasComponent', () => {
  let component: ChristmasComponent;
  let fixture: ComponentFixture<ChristmasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ChristmasComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChristmasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
