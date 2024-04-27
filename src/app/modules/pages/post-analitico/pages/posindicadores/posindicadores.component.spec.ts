import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PosindicadoresComponent } from './posindicadores.component';

describe('PosindicadoresComponent', () => {
  let component: PosindicadoresComponent;
  let fixture: ComponentFixture<PosindicadoresComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PosindicadoresComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PosindicadoresComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
