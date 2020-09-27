import database from '../../../../src/database'

export const up = async () => {
	const users = await database.models.user.find({})
	return await Promise.all(users.map(user => {
		user.username = 'N' + user.username
		return user.save()
	}))
}

export const down = async () => {
	const users = await database.models.user.find({})
	return await Promise.all(users.map(user => {
		user.username = user.username.slice(1)
		return user.save()
	}))
}