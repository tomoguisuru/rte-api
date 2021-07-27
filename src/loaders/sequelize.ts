import { Sequelize } from 'sequelize-typescript';
import { v4 as uuidv4 } from 'uuid';

import config from '../config';
import db from '../../config/db';

export class Sequelizer {
    public sequelize: Sequelize;

    constructor(config: any) {
        config['models'] = [
            __dirname.replace('/loaders', '') + '/models/*.ts',
        ];

        config['define'] = {
            // https://sequelize.org/master/manual/hooks.html
            hooks: {
                beforeCreate: model => {
                    model.id = uuidv4();
                }
            }
        }

        console.log('******************')
        console.log(config['models'])
        console.log('******************')

        this.sequelize = config.url
            ? new Sequelize(config.url, config)
            : new Sequelize(config.database, config.username, config.password, config);
    }
}

const nodeEnv = config.environment;
const dbConfig = db[nodeEnv];

const sequelizer = new Sequelizer(dbConfig);

export default sequelizer.sequelize;
