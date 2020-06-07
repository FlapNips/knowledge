module.exports = app => {
	const {existsOrError, notExistsOrError, equalsOrError} = app.api.validation

	const save = async (req, res) => {
		const category = { ...req.body }
		if(req.params.id) category.id = req.params.id

		try {
			existsOrError(category.name, 'Nome da categoria não informado')

		} catch(error) {
			return res.status(400).send(error)
		}



		if(category.id) {
			app.db('categories')
				.update(category)
				.where({ id: category.id })
				.then(() => res.status(204).send())
				.catch(error => res.status(500).send(error))
		} else {
			const existCategoryOrError = await app.db('categories')
					.select('name')
					.where({ name: category.name})
					.first()
			if(!existCategoryOrError) {
				console.log('criou')
			app.db('categories')
				.insert(category)
				.then( () => res.status(204).send())
				.catch( (error) => res.status(500).send(error))
			} else {
				res.send(console.log('ja existe esse nome'))
			}
		}
	}

	const remove = async (req, res) => {
		try {
		existsOrError(req.params.id, 'Código da categoria não informado!')

		const subcategory = await app.db('category')
			.where({ parentId: req.params.id })

			notExistsOrError(subcategory, 'Categoria possui subcategoria')

		const articles = await app.db('articles')
			.where({ categoryId: req.params.id})

			notExistsOrError(articles, 'Categoria possui artigos')

		const rowsDeleted = await app.db('categories')
			.where({ id: req.params.id}).del()

			existsOrError(rowsDeleted, 'Categoria não foi encontrada')

		res.status(204).send()
		} catch (error) {
			res.status(500).send(error)
		}
	}

	const withPath = categories => {
		const getParent = (categories, parentId) => {
			let parent = categories.filter(parent => parent.id === parentId)
			return parent.length ? parent[0] : null
		}

		const categoriesWithPath = categories.map(category => {
			let path = category.name
			let parent = getParent(categories, category.parentId)

			while(parent) {
				path = `${parent.name} > ${path}`
				parent = getParent(categories, parent.parentId)
			}

			return { ...category, path }
		})

		categoriesWithPath.sort((a, b) => {
			if(a.path < b.path) return -1
			if(a.path > b.path) return 1 
			return 0
		})
		return categoriesWithPath
	
	}

	const get = (req, res) => {
		app.db('categories')
			.select('*')
			.then(categories => {
			res.json(withPath(categories))})
			.catch(error => res.status(500).send(error))
	}

	const getById = async (req,res) => {
	app.db('categories')
		.where({ id: req.params.id })
		.first()
		.then(category => res.json(category))
		.catch(error => res.status(500).send(error))	

	}

	return { save, remove, get, getById}
}