import RBAC from 'fast-rbac';

const roles = {
    admin: {
        can: ['*'],
    },
    publisher: {
        can: ['publisher:read'],
        when: async ctx => {
            return ctx.ownerId === ctx.userId;
        },
    },
};

export default new RBAC({ roles });