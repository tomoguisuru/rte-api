import { camelize, underscore, pluralize } from 'inflection';

import {
  Model,
} from 'sequelize-typescript';

import { Event } from '../models/event';
import { Stream } from '../models/stream';

interface ISerializableOptions {
  keyMap?: {};
  camelize?: boolean;
  prune?: string[];
}

export interface IResponse {
  total_items: number;
}

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

export function eagerLoading<T>(findOptions: T, include: string[]): T {
  const eagerLoad: any[] = [];

  if (include.length > 0) {
    if (include.some(i => /^stream(s)$/.test(i.toLocaleLowerCase()))) {
      eagerLoad.push(Stream);
    }

    if (include.some(i => /^event(s)$/.test(i.toLocaleLowerCase()))) {
      eagerLoad.push(Event);
    }
  }

  if (eagerLoad.length > 0) {
    findOptions['include'] = eagerLoad;
  }

  return findOptions;
}

export function serialize<T>(data: T, options?: ISerializableOptions): T {
  if (!data || !(typeof (data) == 'object')) {
    return data;
  }

  const keys = Object.keys(data);

  if (keys.length > 0) {
    return keys.reduce((rv, key) => {
      let value = data[key];
      let _key = options?.camelize
        ? camelize(key, true)
        : underscore(key); ``

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
    }, ({} as T));
  }

  return data;
}

export function separateIncluded<T>(record): T {
  const matcher = /^(event|stream)s?\.(\w*)/;

  const rels = Object.keys(record).reduce((rx, key) => {
    const match = key.match(matcher);

    if (match) {
      const r = rx[match[1]] = (rx[match[1]] || {});
      r[match[2]] = record[key];

      delete record[key];
    }

    return rx;
  }, {});

  return Object.keys(rels).reduce((rv, r) => {
    const key = pluralize(r);

    const c = rv[key] = (rv[key] || []);

    c.push(rels[r]);

    return rv;
  }, {} as T);
}
