import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GestionAsociacionesMcComponent } from './gestion-asociaciones-mc.component';

describe('GestionAsociacionesMcComponent', () => {
  let component: GestionAsociacionesMcComponent;
  let fixture: ComponentFixture<GestionAsociacionesMcComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GestionAsociacionesMcComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GestionAsociacionesMcComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
