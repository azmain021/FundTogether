import { Test, TestingModule } from '@nestjs/testing';
import { BusinessesController } from './businesses.controller';
import { BusinessesService } from './businesses.service';
import { SessionsService } from '../auth/sessions.service';
import { ConfigService } from '@nestjs/config';

describe('BusinessesController', () => {
  let controller: BusinessesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BusinessesController],
      providers: [
        { provide: BusinessesService, useValue: {} },
        { provide: SessionsService, useValue: {} },
        { provide: ConfigService, useValue: { get: () => undefined } },
      ],
    }).compile();

    controller = module.get<BusinessesController>(BusinessesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
