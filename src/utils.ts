import * as jwt from 'jsonwebtoken';

// 数据库client
export interface Database {}

export interface Context {
	db: Database;
	request: Headers;
}

export function getUserId(ctx: Context) {
	const Authorization = ctx.request.get('Authorization');
	if (Authorization) {
		const token = Authorization.replace('Bearer ', '');
		const { userId } = jwt.verify(token, process.env.APP_SECRET) as { userId: string };
		return userId;
	}

	throw new AuthError();
}

export class AuthError extends Error {
	constructor() {
		super('未经授权的访问');
	}
}
