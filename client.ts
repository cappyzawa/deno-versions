import { Releases } from "./types.ts";
import { LinkHeader, parseLinkHeader } from "./linkHeader.ts";

import { ky, urlParse } from "./deps.ts";

interface Client {
  addr: string;
  httpClient: typeof ky;

  getVersions(owner: string, repo: string): Promise<Releases>;
}

export class GitHub implements Client {
  addr = "https://api.github.com";
  httpClient = ky.create({
    prefixUrl: this.addr,
    headers: {
      Authorization: "token " + Deno.env.get("GITHUB_TOKEN"),
    },
  });

  async getVersions(owner: string, repo: string): Promise<Releases> {
    const path: string = `repos/${owner}/${repo}/releases`;
    const res = await this.httpClient.get(path);
    return this.get(res, []);
  }

  async get(res: Response, releases: Releases): Promise<Releases> {
    const data: Releases = await res.json();
    for (const r of data) {
      releases.push(r);
    }
    const linkHeader = res.headers.get("link")!;
    const links: LinkHeader[] = parseLinkHeader(linkHeader);

    for (const l of links) {
      if (l["rel"] == "next") {
        const u: URL = urlParse(l.uri);
        const path = u.pathname.slice(1);
        const query = u.searchParams.toString();
        const res = await this.httpClient.get(`${path}?${query}`);
        await this.get(res, releases);
      }
    }
    return releases;
  }
}
