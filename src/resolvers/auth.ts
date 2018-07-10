import { getUserId, Context } from '../utils';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';

export const Query = {
	me(parent, args, ctx: Context, info) {
		// user = ctx.db...
		let user
		const id = getUserId(ctx);
		// 查询
		return user;
	}
};

export const Mutation = {
	async login(parent, { name, password }, ctx: Context, info) {
		let user;
		// 比对
		return {
			token: jwt.sign({ userId: user.id }, process.env.APP_SECRET),
			user
		};
	},
	async signUp(parent, { data }, ctx: Context, info) {
		const password = bcrypt.hashSync(data.password, 10);
		let user;
		//  注册

		return {
			token: jwt.sign({ userId: user.id }, process.env.APP_SECRET),
			user
		};
	}
};
