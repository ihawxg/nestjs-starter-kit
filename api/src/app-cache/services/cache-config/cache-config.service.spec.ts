import { Test, TestingModule } from '@nestjs/testing';
import { CacheConfigService } from './cache-config.service';
import { ConfigService } from '@nestjs/config';
import { createKeyv } from '@keyv/redis';

jest.mock('@keyv/redis', () => ({
  createKeyv: jest.fn(),
}));

describe('CacheConfigService', () => {
  let service: CacheConfigService;
  let configService: { get: jest.Mock };

  beforeEach(async () => {
    configService = {
      get: jest.fn().mockReturnValue({
        host: 'host',
        port: 0,
        password: 'password',
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CacheConfigService,
        {
          provide: ConfigService,
          useValue: configService,
        },
      ],
    }).compile();

    service = module.get<CacheConfigService>(CacheConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return redis config', async () => {
    service.createCacheOptions();
    const redisMock = jest.mocked(createKeyv);

    expect(redisMock).toHaveBeenCalledWith({
      socket: {
        host: 'host',
        port: 0,
      },
      password: 'password',
    });
  });

  it('should omit redis password when env value is empty', async () => {
    configService.get.mockReturnValue({
      host: 'host',
      port: 0,
      password: '',
    });

    service.createCacheOptions();
    const redisMock = jest.mocked(createKeyv);

    expect(redisMock).toHaveBeenCalledWith({
      socket: {
        host: 'host',
        port: 0,
      },
      password: undefined,
    });
  });
});
