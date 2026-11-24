/// <reference types="@vicinae/api">

/*
 * This file is auto-generated from the extension's manifest.
 * Do not modify manually. Instead, update the `package.json` file.
 */

type ExtensionPreferences = {
  /** Instance URL - Base URL of your OpenProject instance, e.g. https://openproject.example.com or https://community.openproject.org */
	"instanceUrl": string;

	/** API Token - Personal API token from My Account → Access tokens. Sent as Bearer auth. */
	"apiToken": string;

	/** Default Project ID - Optional numeric project ID used as a baked filter for Search and My Work Packages. Leave empty for all projects. */
	"defaultProjectId"?: string;

	/** Default Status Filter - Baked status filter for Search and My Work Packages */
	"defaultStatusFilter"?: "open" | "closed" | "all";

	/** Page Size - Number of results to fetch per request (1–100) */
	"pageSize"?: string;
}

declare type Preferences = ExtensionPreferences

declare namespace Preferences {
  /** Command: Search Work Packages */
	export type SearchWorkPackages = Omit<ExtensionPreferences, never> & {
		
	}

	/** Command: My Work Packages */
	export type MyWorkPackages = Omit<ExtensionPreferences, never> & {
		
	}

	/** Command: Open Work Package */
	export type OpenWorkPackage = Omit<ExtensionPreferences, never> & {
		
	}

	/** Command: Pinned Queries */
	export type PinnedQueries = Omit<ExtensionPreferences, never> & {
		
	}

	/** Command: Saved Queries */
	export type SavedQueries = Omit<ExtensionPreferences, never> & {
		
	}

	/** Command: Browse Projects */
	export type BrowseProjects = Omit<ExtensionPreferences, never> & {
		
	}
}

declare namespace ToolPreferences {
  
}

declare namespace Arguments {
  /** Command: Search Work Packages */
	export type SearchWorkPackages = {
		
	}

	/** Command: My Work Packages */
	export type MyWorkPackages = {
		
	}

	/** Command: Open Work Package */
	export type OpenWorkPackage = {
		/** Work package ID */
		"id"?: string
	}

	/** Command: Pinned Queries */
	export type PinnedQueries = {
		
	}

	/** Command: Saved Queries */
	export type SavedQueries = {
		
	}

	/** Command: Browse Projects */
	export type BrowseProjects = {
		
	}
}