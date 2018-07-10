import { AuthError, getUserId, Context } from './utils';

export default {
	async hasRole(next, source, { role }, ctx: Context) {
		let user;

		// role 鉴权

		if (!user) throw new AuthError();
		for (let item in role) {
			if (user.role.includes(role[item])) return next();
		}
		throw new AuthError();
	},
	async isAuthenticated(next, source, args, ctx: Context) {
		let user;

		// 是否注册
		
		if (user) return next();
		else throw new AuthError();
	}
};
