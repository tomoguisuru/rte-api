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

interface ISerializableOptions {
    keyMap?: {};
    camelize?: boolean;
    prune?: string[];
}

export function serialize(data = {}, options?: ISerializableOptions) {
    if (!(typeof (data) == 'object')) {
        return data;
    }

    const keys = Object.keys(data);

    if (keys.length > 0) {
        return keys.reduce((rv, key) => {
            let value = data[key];
            let _key = (options?.camelize ? camelize(key, true) : key);

            if (options?.prune?.includes(_key)) {
                return rv;
            }

            if (options?.keyMap) {
                _key = options.keyMap[_key] || _key;
            }

            if (Array.isArray(value)) {
                value = value.map(d => serialize(d, options));
            } else {
                value = serialize(value, options)
            }

            rv[_key] = value;

            return rv
        }, {});
    }

    return data;
}