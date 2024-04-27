import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AsignacionProgramasComponent } from './asignacion-programas.component';

describe('AsignacionProgramasComponent', () => {
  let component: AsignacionProgramasComponent;
  let fixture: ComponentFixture<AsignacionProgramasComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AsignacionProgramasComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AsignacionProgramasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
