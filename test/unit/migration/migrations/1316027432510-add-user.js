import database from '../../../../src/database'

export const up = async () =>
	await database.models.user.create({
		username: "Test", email: "test@test.com",
		password: "mypassword", salt: "mysalt"
})

export const down = async () =>
	await database.models.user.deleteOne({ email: "test@test.com" })