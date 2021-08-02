declare module 'fast-rbac' {
    export default class RBAC {
        constructor(options: Options = {});

        add(
            role: string,
            resource: string,
            operation: string,
            when?: WhenFn
        ): void;

        can<TContext=any>(
            role: string,
            resource: string,
            operation: string,
            context?: TContext,
        ): boolean | Promise<boolean>

        remove(
            role: string,
            resource?: string,
            operation?: string,
        ): void;
    }

    export type WhenFn<TContext=any> = (
        context: TContext
    ) => boolean | Promise<boolean>;

    export interface Refs {
        [roleName: string]: RoleRules;
    }

    export interface OperationRules {
        [operationName: string]: boolean | WhenFn;
    }

    export interface ResourceRules {
        [resourceName: string]: OperationRules;
    }

    export interface RoleRules {
        [roleName: string]: ResourceRules;
    }

    export interface ResourcePermission {
        name: string;
        operation?: string;
        when?: WhenFn;
    }

    export interface RulesObject {
        can: Array<string | ResourcePermission>;
        inherits?: Array<string>;
    }

    export interface Options {
        roles?: {
            [roleName: string]: RulesObject;
        };
        memoize?: boolean;
    }
}
