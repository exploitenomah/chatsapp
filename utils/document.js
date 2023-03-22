class DocumentController {
  constructor(Model) {
    this.Model = Model
  }
  async checkIfExists(data) {
    return await this.Model.exists({ ...data })
  }
  async createDoc(data) {
    let newDoc = await this.Model.create(data)
    newDoc = await newDoc.save()
    return newDoc
  }

  async getDoc(query, select = '') {
    return await this.Model.findOne(query, ' -__v ' + select)
  }

  async updateDoc(filter = {}, update = {}, options = {}) {
    let updDoc = await this.Model.findOneAndUpdate(filter, update, {
      new: true,
      ...options,
    })
    return updDoc
  }

  async deleteDoc(filter = {}) {
    return await this.Model.findOneAndDelete(filter)
  }

  async getMany(searchQuery, populate) {
    let query = null

    //** FIND **//
    let queryObj = { ...searchQuery }
    const excludedFields = ['page', 'sort', 'limit', 'fields']
    excludedFields.forEach((el) => delete queryObj[el])
    let stringifiedQueryObj = JSON.stringify(queryObj)
    stringifiedQueryObj = stringifiedQueryObj.replace(
      /\b(gte|gt|lte|lt|ne|eq|nin|and|not|nor|or|eq)\b/g,
      (match) => `$${match}`,
    )
    query = this.Model.find(JSON.parse(stringifiedQueryObj))

    //** SORT **//
    if (searchQuery.sort) {
      const sortBy = searchQuery.sort.split(',').join(' ')
      query = query.sort(sortBy)
    } else query = query.sort('-createdAt')

    //** SELECT FIELDS **//
    if (searchQuery.fields) {
      const fields = searchQuery.fields.split(',').join(' ')
      query = query.select(fields)
    } else query = query.select('-__v')

    //** PAGINATE **//
    const page = searchQuery.page * 1 || 1
    const limit = searchQuery.limit * 1 || 100
    const skip = (page - 1) * limit
    query = query.skip(skip).limit(limit)

    if (populate) query.populate(populate)
    return await query
  }
}
module.exports = DocumentController
