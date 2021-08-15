export interface LinkHeader {
  uri: string;
  [index: string]: string;
}

interface StringDict {
  [index: string]: string;
}

export function extractLinks(header: string): string[] {
  if (header == "") {
    return [];
  }

  const linksPattern = /,?\s</gm;
  let links = header.split(linksPattern);

  links = links.map((link, index) => {
    if (index > 0) {
      return "<" + link;
    }
    return link;
  });

  return links;
}

export function extractParameters(header: string): StringDict {
  if (header == "") {
    return {};
  }

  const uriPattern = /<(.+)>/m;
  const headerWithoutUri = header.replace(uriPattern, "");

  const paramPattern = /(\w+)="?(\w+)"?/gm;
  const paramMatches = headerWithoutUri.matchAll(paramPattern);
  let params: StringDict = {};
  for (const match of paramMatches) {
    const [_, key, value] = match;
    params[key] = value;
  }

  return params;
}

export function extractUri(header: string): (null | string) {
  const uriPattern = /<(.+)>/m;
  const uriMatch = uriPattern.exec(header);
  if (uriMatch == null) {
    return null;
  }
  const uri = uriMatch[1];
  return uri;
}

function parseOneLinkHeader(header: string): LinkHeader {
  const uri = extractUri(header);
  const params = extractParameters(header);

  if (uri == "") {
    return { uri: "", ...params };
  }
  return { uri: uri!, ...params };
}

export function parseLinkHeader(header: string): LinkHeader[] {
  if (header == "") {
    return [];
  }

  const linkHeaders: string[] = extractLinks(header);

  return linkHeaders.map(parseOneLinkHeader);
}
