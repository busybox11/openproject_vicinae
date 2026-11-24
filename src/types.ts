export type StatusFilter = "open" | "closed" | "all";

export type Preferences = {
  instanceUrl: string;
  apiToken: string;
  defaultProjectId?: string;
  defaultStatusFilter?: StatusFilter;
  pageSize?: string;
};

export type HalLink = {
  href: string | null;
  title?: string;
  templated?: boolean;
};

export type WorkPackage = {
  id: number;
  subject: string;
  description?: { raw?: string; html?: string };
  createdAt?: string;
  updatedAt?: string;
  _links: {
    self: HalLink;
    status?: HalLink;
    type?: HalLink;
    priority?: HalLink;
    assignee?: HalLink;
    project?: HalLink;
    author?: HalLink;
  };
};

export type Project = {
  id: number;
  identifier: string;
  name: string;
  description?: { raw?: string; html?: string };
  active?: boolean;
  _links: {
    self: HalLink;
  };
};

export type Query = {
  id: number;
  name: string;
  starred?: boolean;
  public?: boolean;
  _links: {
    self: HalLink;
    project?: HalLink;
  };
};

export type Collection<T> = {
  _type: string;
  total: number;
  count: number;
  pageSize: number;
  offset: number;
  _embedded: {
    elements: T[];
  };
};

export type QueryWithResults = Query & {
  _embedded?: {
    results?: Collection<WorkPackage>;
  };
};

export type FilterObject = Record<
  string,
  { operator: string; values: string[] }
>;
