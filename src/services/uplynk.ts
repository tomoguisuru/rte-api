// import { Response as MirageResponse } from 'miragejs';

import Container from "typedi";

export class UplynkService {
    public static async Get(url: string, params?: object, filter?: object): Promise<any> {
        const server: any = Container.get('server');

        const [, modelName, modelId] = url.split('/');
        const collection = server.schema[modelName];

        let data = null;

        if (!modelId) {
            if (!params) {
                data = collection.all();
            } else {
                data = collection.where(filter);
            }

        } else {
            data = collection.find(modelId);
        }

        return this.buildResponse(data, params);
    }

    public static async Patch(url: string, params?: object): Promise<void> {
        const server: any = Container.get('server');

        const [, modelName, modelId] = url.split('/');
        const collection = server.schema[modelName];

        if (!modelId) {
            throw new Error('Not Found');
        }

        const model = collection.find(modelId);

        if (!model) {
            throw new Error('Not Found');
        }

        model.update(params);
    }

    private static buildResponse(data, params = {}) {
        const server: any = Container.get('server');

        const json = server.serializerOrRegistry.serialize(data, params);

        // return new MirageResponse(200, {}, json);
    }
}