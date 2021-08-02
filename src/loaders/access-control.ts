import RBAC, { Options } from 'fast-rbac';

const options: Options = {
    roles: {
        admin: {
            can: ['*'],
        },
        publisher: {
            can: [{
                name: 'publisher:read',
                when: async ctx => {
                    return ctx.ownerId === ctx.userId;
                },
            }],
        },
    }
};

export default new RBAC(options);