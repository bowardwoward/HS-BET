import { Test, TestingModule } from '@nestjs/testing';
import { ClientService } from './client.service';
import { HttpService } from '@nestjs/axios';

describe('ClientService', () => {
  let service: ClientService;
  let httpService: HttpService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ClientService,
        {
          provide: HttpService,
          useValue: {
            get: () => process.env.CBS_ENDPOINT,
          },
        },
      ],
    }).compile();

    service = module.get<ClientService>(ClientService);
    httpService = module.get<HttpService>(HttpService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('Http Service should be defined', () => {
    expect(httpService).toBeDefined();
  });
});
