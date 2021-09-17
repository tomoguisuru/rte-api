import { Request } from 'express';

export interface IPaginate {
  page: number;
  page_size: number;
}

export interface IQueryable {
  where?: any;
  raw?: boolean;
}

export function getPagination(req: Request): IPaginate {
  let {
    page,
    page_size,
  } = req.query;

  const pagination: IPaginate = {
    page: 1,
    page_size: 10,
  };

  if (page) {
    pagination['page'] = parseInt(page as string, 10);
  }

  if (page_size) {
    pagination['page_size'] = parseInt(page_size as string, 10);
  }

  return pagination;
}

export function paginate(req: Request, query: IQueryable = {}) {
  const { page, page_size } = getPagination(req);

  const {
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
