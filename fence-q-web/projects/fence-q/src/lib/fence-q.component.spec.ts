import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FenceQComponent } from './fence-q.component';

describe('FenceQComponent', () => {
  let component: FenceQComponent;
  let fixture: ComponentFixture<FenceQComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FenceQComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FenceQComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
