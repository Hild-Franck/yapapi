export const dbConfig = {
	host: process.env.MONGO_HOST || 'localhost',
	database: 'db',
	currentMigration: '',
	options : {
		useNewUrlParser: true	
	}
}