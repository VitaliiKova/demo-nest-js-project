import { Injectable } from '@nestjs/common';
import { HeadersForGit } from '../model/headers-for-git';

@Injectable()
export class HeadersBuilder {
  public getHeadersForGitHub(headers): HeadersForGit {
    const headersForGitHub: HeadersForGit = {
      accept: headers.accept,
    };
    if (headers.authorization) {
      headersForGitHub.authorization = `token ${headers.authorization}`;
    }

    return headersForGitHub;
  }
}
