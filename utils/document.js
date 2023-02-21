class DocumentController {
  constructor(Model) {
    this.Model = Model
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
}
module.exports = DocumentController
