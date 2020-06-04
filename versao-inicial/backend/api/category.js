module.exports = app => {
	const {existOrError, notExistOrError} = app.api.validation

	const save = (req, res) => {
		const category = { ...req.body }
		if (req.params.id) category.id = req.params.id

		try {
			existOrError(category.name, 'Nome da categoria não informado')

		} catch(error) {
			return res.status(400).send(msg)
		}
	}
}