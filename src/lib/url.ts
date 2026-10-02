const base = import.meta.env.BASE_URL.replace(/\/$/, "");

/** Prefix an internal path with the site's base path, e.g. url("projects/ordersync/"). */
export const url = (path = "") => `${base}/${path.replace(/^\//, "")}`;
