const isInScope = function(scopes) {
	return this.roles.some(scope => scopes.includes(scope))
}

export default { isInScope }