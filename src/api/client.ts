import type {
  Collection,
  FilterObject,
  Project,
  Query,
  QueryWithResults,
  WorkPackage,
} from "../types";
import { getPrefs, type ResolvedPreferences } from "../preferences";

export class OpenProjectError extends Error {
  constructor(
    message: string,
    readonly status?: number,
  ) {
    super(message);
    this.name = "OpenProjectError";
  }
}

export type SortBy = Array<[string, "asc" | "desc"]>;

export const WORK_PACKAGE_SORT: SortBy = [["updatedAt", "desc"]];
export const PROJECT_SORT: SortBy = [["name", "asc"]];
export const QUERY_SORT: SortBy = [["name", "asc"]];

type RequestOptions = {
  path: string;
  query?: Record<string, string | number | undefined>;
  filters?: FilterObject[];
  sortBy?: SortBy;
};

function encodeFilters(filters: FilterObject[]): string {
  return JSON.stringify(filters);
}

export function nextCollectionPage(collection: {
  offset: number;
  pageSize: number;
  count: number;
  total: number;
}): number | undefined {
  const loaded = (collection.offset - 1) * collection.pageSize + collection.count;
  return loaded < collection.total ? collection.offset + 1 : undefined;
}

export class OpenProjectClient {
  constructor(private readonly prefs: ResolvedPreferences) {}

  static fromPrefs(): OpenProjectClient {
    return new OpenProjectClient(getPrefs());
  }

  get instanceUrl(): string {
    return this.prefs.instanceUrl;
  }

  get pageSize(): number {
    return this.prefs.pageSize;
  }

  private async request<T>({
    path,
    query,
    filters,
    sortBy,
  }: RequestOptions): Promise<T> {
    const url = new URL(`${this.prefs.instanceUrl}${path}`);
    if (query) {
      for (const [key, value] of Object.entries(query)) {
        if (value === undefined) continue;
        url.searchParams.set(key, String(value));
      }
    }
    if (filters && filters.length > 0) {
      url.searchParams.set("filters", encodeFilters(filters));
    }
    if (sortBy && sortBy.length > 0) {
      url.searchParams.set("sortBy", JSON.stringify(sortBy));
    }

    let response: Response;
    try {
      response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${this.prefs.apiToken}`,
          Accept: "application/hal+json",
          "Content-Type": "application/json",
        },
      });
    } catch (error) {
      const detail = error instanceof Error ? error.message : String(error);
      throw new OpenProjectError(
        `Could not reach ${this.prefs.instanceUrl}. Check the Instance URL (${detail}).`,
      );
    }

    if (!response.ok) {
      let message = `OpenProject API error (${response.status})`;
      try {
        const body = (await response.json()) as { message?: string };
        if (body.message) message = body.message;
      } catch {}
      if (response.status === 401 || response.status === 403) {
        message = "Unauthorized. Check your API token and instance URL.";
      }
      throw new OpenProjectError(message, response.status);
    }

    return (await response.json()) as T;
  }

  getWorkPackage(id: number): Promise<WorkPackage> {
    return this.request({ path: `/api/v3/work_packages/${id}` });
  }

  listWorkPackages(options: {
    filters?: FilterObject[];
    pageSize?: number;
    offset?: number;
    sortBy?: SortBy;
  } = {}): Promise<Collection<WorkPackage>> {
    return this.request({
      path: "/api/v3/work_packages",
      filters: options.filters,
      sortBy: options.sortBy ?? WORK_PACKAGE_SORT,
      query: {
        pageSize: options.pageSize ?? this.prefs.pageSize,
        offset: options.offset ?? 1,
      },
    });
  }

  listProjects(options: {
    filters?: FilterObject[];
    pageSize?: number;
    offset?: number;
    sortBy?: SortBy;
  } = {}): Promise<Collection<Project>> {
    return this.request({
      path: "/api/v3/projects",
      filters: options.filters,
      sortBy: options.sortBy ?? PROJECT_SORT,
      query: {
        pageSize: options.pageSize ?? this.prefs.pageSize,
        offset: options.offset ?? 1,
      },
    });
  }

  listQueries(options: {
    filters?: FilterObject[];
    pageSize?: number;
    offset?: number;
    sortBy?: SortBy;
  } = {}): Promise<Collection<Query>> {
    return this.request({
      path: "/api/v3/queries",
      filters: options.filters,
      sortBy: options.sortBy ?? QUERY_SORT,
      query: {
        pageSize: options.pageSize ?? this.prefs.pageSize,
        offset: options.offset ?? 1,
      },
    });
  }

  getQuery(
    id: number,
    options: { pageSize?: number; offset?: number; sortBy?: SortBy } = {},
  ): Promise<QueryWithResults> {
    return this.request({
      path: `/api/v3/queries/${id}`,
      sortBy: options.sortBy ?? WORK_PACKAGE_SORT,
      query: {
        pageSize: options.pageSize ?? this.prefs.pageSize,
        offset: options.offset ?? 1,
      },
    });
  }
}
