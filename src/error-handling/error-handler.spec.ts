import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, HttpException } from '@nestjs/common';

import { HttpExceptionFilter } from './error-handler';

const mockJson = jest.fn();
const mockStatus = jest.fn().mockImplementation(() => ({
  json: mockJson,
}));
const mockGetResponse = jest.fn().mockImplementation(() => ({
  status: mockStatus,
}));
const mockHttpArgumentsHost = jest.fn().mockImplementation(() => ({
  getResponse: mockGetResponse,
  getRequest: jest.fn(),
}));

const mockArgumentsHost = {
  switchToHttp: mockHttpArgumentsHost,
  getArgByIndex: jest.fn(),
  getArgs: jest.fn(),
  getType: jest.fn(),
  switchToRpc: jest.fn(),
  switchToWs: jest.fn(),
};

describe('Check error handler', () => {
  let errorHandler: HttpExceptionFilter;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [HttpExceptionFilter],
    }).compile();
    errorHandler = module.get<HttpExceptionFilter>(HttpExceptionFilter);
  });

  it('should be defined', () => {
    expect(errorHandler).toBeDefined();
  });

  it('Http exception', () => {
    errorHandler.catch(
      new HttpException('Http exception', HttpStatus.BAD_REQUEST),
      mockArgumentsHost,
    );
    expect(mockHttpArgumentsHost).toBeCalledTimes(1);
    expect(mockHttpArgumentsHost).toBeCalledWith();
    expect(mockGetResponse).toBeCalledTimes(1);
    expect(mockGetResponse).toBeCalledWith();
    expect(mockStatus).toBeCalledTimes(1);
    expect(mockStatus).toBeCalledWith(HttpStatus.BAD_REQUEST);
    expect(mockJson).toBeCalledTimes(1);
    expect(mockJson).toBeCalledWith({
      message: 'Http exception',
      status: 400,
    });
  });

  it('Custom exception', () => {
    errorHandler.catch(new Error('Something went wrong'), mockArgumentsHost);
    expect(mockHttpArgumentsHost).toBeCalledTimes(1);
    expect(mockHttpArgumentsHost).toBeCalledWith();
    expect(mockGetResponse).toBeCalledTimes(1);
    expect(mockGetResponse).toBeCalledWith();
    expect(mockStatus).toBeCalledTimes(1);
    expect(mockStatus).toBeCalledWith(HttpStatus.BAD_REQUEST);
    expect(mockJson).toBeCalledTimes(1);
    expect(mockJson).toBeCalledWith({
      message: 'Something went wrong',
      status: 400,
    });
  });
});
