import { Releases } from "./types.ts";
import { LinkHeader, parseLinkHeader } from "./linkHeader.ts";

import { ky, urlParse } from "./deps.ts";

export class Client {
  constructor(token: string | undefined, addr?: string) {
    this.addr = "https://api.github.com";
    if (addr) {
      this.addr = addr;
    }
    this.httpClient = ky.create({
      prefixUrl: this.addr,
      headers: {
        Authorization: "token " + token,
      },
    });
  }

  addr: string;
  httpClient: typeof ky;

  async getVersions(owner: string, repo: string): Promise<Releases> {
    const path: string = `repos/${owner}/${repo}/releases`;
    const res: Response = await this.httpClient.get(path);
    return this.get(res, []);
  }

  async get(res: Response, releases: Releases): Promise<Releases> {
    const data: Releases = await res.json();
    data.map((r) => releases.push(r));
    const linkHeader = res.headers.get("link")!;
    const links: LinkHeader[] = parseLinkHeader(linkHeader);

    await Promise.all(links.map(async (l) => {
      if (l["rel"] == "next") {
        const u: URL = urlParse(l.uri);
        const path = u.pathname.slice(1);
        const query = u.searchParams.toString();
        const res = await this.httpClient.get(`${path}?${query}`);
        await this.get(res, releases);
      }
    }));
    return releases;
  }
}
