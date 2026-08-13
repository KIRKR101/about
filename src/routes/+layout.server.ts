import { recentWritings } from '$lib/writings-data';
import { projects } from '$lib/projects-data';

export const prerender = true;

export function load() {
	return {
		allWritings: recentWritings,
		allProjects: projects
	};
}
