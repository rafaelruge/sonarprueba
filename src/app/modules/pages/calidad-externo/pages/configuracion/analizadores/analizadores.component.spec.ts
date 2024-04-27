import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AnalizadoresComponent } from './analizadores.component';

describe('AnalizadoresComponent', () => {
  let component: AnalizadoresComponent;
  let fixture: ComponentFixture<AnalizadoresComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AnalizadoresComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AnalizadoresComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
