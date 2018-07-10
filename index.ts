import { GraphQLServer } from 'graphql-yoga';
import { Database } from './src/utils';
import resolvers from './src/resolvers';
import directiveResolvers from './src/directiveResolvers';

// 数据库client
let db: Database;

const server = new GraphQLServer({
	typeDefs: './src/schema.graphql',
	resolvers,
	directiveResolvers,
	context: (req) => ({
		...req,
		db
	})
});
server.start(() => console.log(`Server is running on http://localhost:4000`));
