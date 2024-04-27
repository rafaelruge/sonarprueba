import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CriticosMedicoTratanteComponent } from './criticos-medico-tratante.component';

describe('CriticosMedicoTratanteComponent', () => {
  let component: CriticosMedicoTratanteComponent;
  let fixture: ComponentFixture<CriticosMedicoTratanteComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CriticosMedicoTratanteComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CriticosMedicoTratanteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
