const admin = require('./admin.js')
module.exports = app => {
	app.post('/signup', app.api.user.save)
	app.post('/signin', app.api.auth.signin)
	app.post('/validadetoken', app.api.auth.validateToken)

	app.route('/users')
		.all(app.config.passport.authenticate())
		.post(app.api.user.save)
		.get(app.api.user.get)
	
	app.route('/users/:id')
		.all(app.config.passport.authenticate())
		.put(app.api.user.save)
		.get(app.api.user.getById)

	app.route('/category')
		.all(app.config.passport.authenticate())
		.post(app.api.category.save)
		.get(admin(app.api.category.get))
	
	app.route('/category/:id')
		.all(app.config.passport.authenticate())
		.get(app.api.category.getById)
		.put(app.api.category.save)
		.delete(app.api.category.remove)
}