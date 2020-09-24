export const dbConfig = {
	host: process.env.MONGO_HOST || 'localhost',
	username: process.env.MONGO_USERNAME,
	password: process.env.MONGO_PASSWORD,
	database: 'db',
	currentMigration: '',
	pepper: process.env.PEPPER || '',
	options : {
		useNewUrlParser: true	
	}
}