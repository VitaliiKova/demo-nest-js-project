import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { HeadersForGit } from '../model/headers-for-git';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AxiosResponse } from 'axios';

@Injectable()
export class GithubApiClientService {
  constructor(private readonly httpService: HttpService) {}

  get<T>(path: string, headers: HeadersForGit): Observable<T> {
    return this.httpService
      .get(path, {
        headers,
      })
      .pipe(map((res: AxiosResponse) => res.data));
  }
}
