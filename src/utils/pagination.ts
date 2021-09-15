import { Request } from 'express';

export interface IPaginate {
    page?: number;
    page_size?: number;
}

export interface IQueryable extends IPaginate {
    where?: any;
    raw?: boolean;
}

export function getPagination(req: Request): IPaginate {
    let {
        page,
        page_size,
    } = req.query;

    const pagination: IPaginate = {};

    if (page) {
        pagination['page'] = parseInt(page as string, 10);
    }

    if (page_size) {
        pagination['page_size'] = parseInt(page_size as string, 10);
    }
}

export function paginate(query: IQueryable = {}) {
    const {
        page = 1,
        page_size = 10,
        raw = true,
        where,
    } = query;

    const data = {
        limit: page_size,
        offset: ((page - 1) * page_size),
    }

    if (where) {
        data['where'] = where;
    }

    if (raw) {
        data['raw'] = true;
    }

    return data;
}