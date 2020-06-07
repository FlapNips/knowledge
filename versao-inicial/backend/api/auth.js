const { authSecret } = require('../.env')
const jwt = require ('jwt-simple')
const bcrypt = require('bcrypt-nodejs')

module.exports = app => {
	const signin = async (req, res) => {
		if(!req.body.email || !req.body.password) {
			return res.status(400).send("Informe o email e a senha !")
		}

		const user = await app.db('users')
			.where({ email: req.body.email })
			.first()

			if(!user) res.status(400).send('Email não encontrado')

			const isMatch = bcrypt.compareSync(req.body.password, user.password)
			if(!isMatch) return res.status(401).send('Senha errada!')

			const now = Math.floor(Date.now() / 1000)

			const payload = {
				id: user.id,
				name: user.name,
				email: user.email,
				admin: user.admin,
				iat: now,
				exp: now + (60*60)
			}

			res.json({
				...payload,
				token: jwt.encode(payload, authSecret)
			})
	}

	const validateToken = async (req, res) => {
		const userData = req.body || null
		try {
			if(userData) {
				const token = jwt.decode(userData.token, authSecret)
				if(new Date(token.exp * 1000) > new Date()) {
					console.log(new Date())
					return res.send(true)
				}
			}
		} catch(error) {
			//problema com o token

		}
		res.send(false)
	}

	return {signin, validateToken}
}