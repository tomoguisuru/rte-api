import { Sequelize } from 'sequelize-typescript';
import { Container } from 'typedi';
import { Logger } from 'winston';

import { v4 as uuidv4 } from 'uuid';

import config from '../config';
import db from '../../config/db';
import { mode } from 'crypto-js';

class Sequelizer {
    public sequelize: Sequelize;

    constructor(config: any) {
        config['models'] = [__dirname.replace('/loaders', '') + '/models/*.ts'];

        config['define'] = {
            // https://sequelize.org/master/manual/hooks.html
            hooks: {
                afterCreate: model => {
                    if ('afterCreate' in model) {
                        model.afterCreate();
                    }
                },
                beforeCreate: model => {
                    model.id = uuidv4();

                    if ('beforeCreate' in model) {
                        model.beforeCreate();
                    }
                }
            }
        }

        this.sequelize = config.url
            ? new Sequelize(config.url, config)
            : new Sequelize(config.database, config.username, config.password, config);
    }
}


export default () => {
    const container = 'sequelize';
    const nodeEnv = config.environment;
    const logger: Logger = Container.get('logger');

    if (nodeEnv) {
        const nodeEnv = config.environment;
        const dbConfig = db[nodeEnv];

        const sequelizer = new Sequelizer(dbConfig);

        Container.set(container, sequelizer.sequelize);

        logger.info(`✌️ sequelize injected into container as ${container}`);
    } else {
        throw new Error('No ENV set');
    }
}
