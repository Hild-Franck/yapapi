export const dbConfig = {
	host: process.env.MONGO_HOST || 'localhost',
	database: 'db',
	currentMigration: '',
	pepper: process.env.PEPPER || '',
	options : {
		useNewUrlParser: true	
	}
}