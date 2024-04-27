import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GestionInstrumentosLabComponent } from './gestion-instrumentos-lab.component';

describe('GestionInstrumentosLabComponent', () => {
  let component: GestionInstrumentosLabComponent;
  let fixture: ComponentFixture<GestionInstrumentosLabComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GestionInstrumentosLabComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GestionInstrumentosLabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
