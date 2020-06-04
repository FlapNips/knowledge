const bcrypt = require('bcrypt-nodejs')

module.exports = app => {
	const {existsOrError, notExistsOrError, equalsOrError} = app.api.validation

	const encryptPassword = password => {
		const salt = bcrypt.genSaltSync(10)
		return bcrypt.hashSync(password, salt)
	}

	const save = async (req, res) => {
		const user = { ...req.body }
		if (req.params.id) user.id = req.params.id
		try {
			existsOrError(user.name, 'Nome não informado')
			console.log('passou etapa 1')
			existsOrError(user.email, 'Email não informado')
			console.log('passou etapa 2')
			existsOrError(user.password, 'Senha não informada')
			console.log('passou etapa 3')
			existsOrError(user.confirmPassword, 'Confirmação de senha inválida')
			console.log('passou etapa 4')
			equalsOrError(user.password , user.confirmPassword, 'Senhar não conferem')
			console.log('passou etapa 5')
			
			const userFromDB = await app.db('users')
				.where({email: user.email}).first()
			if(!user.id) {
				notExistsOrError(userFromDB, 'Usuário já cadastrado')
			}
		}catch(msg){
			return res.status(400).send(msg)
		}
		console.log('continuo rodando')
		user.password = encryptPassword(user.password)
		delete user.confirmPassword
	
		if(user.id) {
			app.db('users')
				.update(user)
				.where({id: user.id})
				.then(()=> res.status(204))
				.catch(error=> res.status(500).send(error))
		} else {
			app.db('users')
				.insert(user)
				.then(()=> res.status(204))
				.catch(error => res.status(500).send(error))

		}
		console.log('continuo rodando 2')

	}
	const get = (req,res) => {
		app.db('users')
			.select('id', 'name', 'email', 'admin')
			.then(users => res.json(users))
			.catch(error => res.status(500).send(error))
	}
	const getById = (req,res) => {
		app.db('users')
			.select('id','name','email','admin')
			.where({ id: req.params.id })
			.then(user => res.json(user))
			.catch(error => res.status(500).send(error))
	}
	return { save, get, getById }
}