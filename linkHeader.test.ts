import {
  extractLinks,
  extractParameters,
  extractUri,
  parseLinkHeader,
} from "./linkHeader.ts";

import { assertEquals } from "https://deno.land/std@0.104.0/testing/asserts.ts";

const linkHeader: string =
  '<https://api.github.com/user/9287/repos?page=3&per_page=100>; rel="next", ' +
  '<https://api.github.com/user/9287/repos?page=1&per_page=100>; rel="prev"; pet="cat", ' +
  '<https://api.github.com/user/9287/repos?page=5&per_page=100>; rel="last"';

Deno.test("Test extractLinks", () => {
  const links: string[] = extractLinks(linkHeader);
  assertEquals(links.length, 3);
  assertEquals(
    links[0],
    '<https://api.github.com/user/9287/repos?page=3&per_page=100>; rel="next"',
  );
  assertEquals(
    links[1],
    '<https://api.github.com/user/9287/repos?page=1&per_page=100>; rel="prev"; pet="cat"',
  );
  assertEquals(
    links[2],
    '<https://api.github.com/user/9287/repos?page=5&per_page=100>; rel="last"',
  );
});

Deno.test("Test extractParameters", () => {
  const links = extractLinks(linkHeader);
  assertEquals(extractParameters(links[0])["rel"], "next");
  assertEquals(extractParameters(links[1])["rel"], "prev");
  assertEquals(extractParameters(links[1])["pet"], "cat");
  assertEquals(extractParameters(links[2])["rel"], "last");
});

Deno.test("Test extractUri", () => {
  const links = extractLinks(linkHeader);
  assertEquals(
    extractUri(links[0]),
    "https://api.github.com/user/9287/repos?page=3&per_page=100",
  );
  assertEquals(
    extractUri(links[1]),
    "https://api.github.com/user/9287/repos?page=1&per_page=100",
  );
  assertEquals(
    extractUri(links[2]),
    "https://api.github.com/user/9287/repos?page=5&per_page=100",
  );
});

Deno.test("Test parseLinkHeader", () => {
  const parsed = parseLinkHeader(linkHeader);
  assertEquals(
    parsed[0].uri,
    "https://api.github.com/user/9287/repos?page=3&per_page=100",
  );
  assertEquals(
    parsed[0]["rel"],
    "next",
  );
  assertEquals(
    parsed[1].uri,
    "https://api.github.com/user/9287/repos?page=1&per_page=100",
  );
  assertEquals(
    parsed[1]["pet"],
    "cat",
  );
});
