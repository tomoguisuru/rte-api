import { camelize } from 'inflection';

export function camelizeData(data, keyMap = {}, include: string[] = []) {
    if (!data) {
        return null;
    }

    const _data = {};

    Object.keys(data)
        .forEach(key => {
            let destinationKey = camelize(key, true).replace(/^@/, '');
            destinationKey = keyMap[destinationKey] || destinationKey;

            if (!include.includes(destinationKey)) {
                return;
            }

            _data[keyMap[destinationKey] || destinationKey] = data[key];
        });

    return _data;
}

export function camelizeItems(resp, keyMap = {}, include: string[] = []) {
    if (!('items' in resp)) {
        return resp;
    }

    const { items = [] } = resp;
    const data: any[] = [];

    items.forEach((event: any) => {
        const _event = camelizeData(event, keyMap, include)
        data.push(_event);
    });

    resp['items'] = data;

    delete resp['@id'];
    delete resp['@type'];

    return resp;
}