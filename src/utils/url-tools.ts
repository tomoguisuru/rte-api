export function paramsToQueryString(params = {}) {
    const keys = Object.keys(params);
    const qs = keys
        .map(k => `${encodeURIComponent(k)}=${encodeURIComponent(params[k])}`)
        .join('&');

    return qs;
}

export function buildUrl(url, query = {}) {
    const qs = paramsToQueryString(query);

    return [
        url,
        qs
    ].join('?');
}