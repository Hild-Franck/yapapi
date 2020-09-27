import database from '../../../../src/database'

export const up = async () => {
	const users = await database.models.user.find({})
	return await Promise.all(users.map(user => {
		user.username = user.username + "NO"
		return user.save()
	}))
}

export const down = async () => {
	const users = await database.models.user.find({})
	return await Promise.all(users.map(user => {
		user.username = user.username.slice(0, -2)
		return user.save()
	}))
}