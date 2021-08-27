export function paramsToQueryString(params = {}) {
    const keys = Object.keys(params);
    const qs = keys
        .map(k => `${encodeURIComponent(k)}=${encodeURIComponent(params[k])}`)
        .join('&');

    return qs;
}

export function buildUrl(url, query = {}) {
    if (Object.keys(query).length === 0) {
        return url;
    }

    const qs = paramsToQueryString(query);

    return [
        url,
        qs
    ].join('?');
}