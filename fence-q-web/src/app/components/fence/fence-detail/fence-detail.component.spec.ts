import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FenceDetailComponent } from './fence-detail.component';

describe('FenceDetailComponent', () => {
  let component: FenceDetailComponent;
  let fixture: ComponentFixture<FenceDetailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FenceDetailComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FenceDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
