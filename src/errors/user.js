export const INVALID_AUTH_FORM = {
	error: 'Need username, password and email to be able to signup',
	statusCode: 400
}

export const USER_CONFLICT = {
	error: 'User already exists',
	statusCode: 429
}

export const EMAIL_CONFLICT = {
	error: 'Email already in use',
	statusCode: 429
}

export const NO_USER = {
	error: 'User does not exist',
	statusCode: 404
}

export const WRONG_PASSWORD = {
	error: 'Wrong password',
	statusCode: 401
}