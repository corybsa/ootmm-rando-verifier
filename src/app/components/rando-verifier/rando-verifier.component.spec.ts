import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RandoVerifierComponent } from './rando-verifier.component';

describe('RandoVerifierComponent', () => {
  let component: RandoVerifierComponent;
  let fixture: ComponentFixture<RandoVerifierComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RandoVerifierComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RandoVerifierComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
