import ky from "https://cdn.skypack.dev/ky?dts";
import { Command } from "https://deno.land/x/cliffy/command/mod.ts";
import { Releases } from "./types.ts";
import { LinkHeader, parseLinkHeader } from "./linkHeader.ts";

const GITHUB_OWNER: string = "denoland";
const GITHUB_REPO: string = "deno";

const client = ky.create({
  headers: {
    Authorization: "token " + Deno.env.get("GITHUB_TOKEN"),
  },
});

await new Command()
  .name("deno-verions")
  .version("0.0.1")
  .description("Show versions of Deno")
  .action(async () => {
    const res = await client.get(
      `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/releases`,
    );

    showVersion(res);
  })
  .parse(Deno.args);

async function showVersion(res: Response) {
  const releases: Releases = await res.json();
  for (const r of releases) {
    console.log(r.tag_name);
  }
  const linkHeader = res.headers.get("link")!;
  const links: LinkHeader[] = parseLinkHeader(linkHeader);
  for (const l of links) {
    if (l["rel"] == "next") {
      const res = await client.get(l.uri);
      showVersion(res);
    }
  }
}
