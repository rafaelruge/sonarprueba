import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FiltroGrubbsComponent } from './filtro-grubbs.component';

describe('FiltroGrubbsComponent', () => {
  let component: FiltroGrubbsComponent;
  let fixture: ComponentFixture<FiltroGrubbsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FiltroGrubbsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FiltroGrubbsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
