import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GestionLotesComponent } from './gestion-lotes.component';

describe('GestionLotesComponent', () => {
  let component: GestionLotesComponent;
  let fixture: ComponentFixture<GestionLotesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GestionLotesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GestionLotesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
