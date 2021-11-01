import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { HeadersForGit } from '../model/headers-for-git';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class GithubApiClientService {
  public constructor(private readonly httpService: HttpService) {}

  get<T>(path: string, headers: HeadersForGit): Observable<T> {
    return this.httpService
      .get(path, {
        headers: headers,
      })
      .pipe(map((res) => res.data));
  }
}
