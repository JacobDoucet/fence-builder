import { TestBed } from '@angular/core/testing';

import { FenceQService } from './fence-q.service';

describe('FenceQService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: FenceQService = TestBed.get(FenceQService);
    expect(service).toBeTruthy();
  });
});
