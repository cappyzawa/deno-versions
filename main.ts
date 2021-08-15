import { Command } from "https://deno.land/x/cliffy/command/mod.ts";
import { Releases } from "./types.ts";
import { GitHub } from "./client.ts"

const GITHUB_OWNER: string = "denoland";
const GITHUB_REPO: string = "deno";

await new Command()
  .name("deno-verions")
  .version("0.0.2")
  .description("Show versions of Deno")
  .action(async () => {
    const client = new GitHub()
    const releases: Releases = await client.getVersions(GITHUB_OWNER, GITHUB_REPO)

    for (const r of releases) {
      console.log(r.tag_name)
    }
  })
  .parse(Deno.args);
