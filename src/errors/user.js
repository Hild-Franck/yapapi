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