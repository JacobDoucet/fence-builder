import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectEntityComponent } from './select-entity.component';

describe('SelectEntityComponent', () => {
  let component: SelectEntityComponent;
  let fixture: ComponentFixture<SelectEntityComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SelectEntityComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SelectEntityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
