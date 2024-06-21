import { TestBed, inject } from '@angular/core/testing';

import { ModellerService } from './modeller.service';

describe('ModellerService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ModellerService]
    });
  });

  it('should be created', inject([ModellerService], (service: ModellerService) => {
    expect(service).toBeTruthy();
  }));
});
