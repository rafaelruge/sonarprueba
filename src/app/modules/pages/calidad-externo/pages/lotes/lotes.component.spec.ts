import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LotesComponent } from './lotes.component';

describe('LotesComponent', () => {
  let component: LotesComponent;
  let fixture: ComponentFixture<LotesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LotesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LotesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
