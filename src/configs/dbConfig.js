export const dbConfig = {
	uri: process.env.MONGODB_URI,
	host: process.env.MONGO_HOST || process.env.MONGODB_URI || 'localhost',
	database: 'db',
	currentMigration: '',
	pepper: process.env.PEPPER || '',
	options : {
		useNewUrlParser: true	
	}
}