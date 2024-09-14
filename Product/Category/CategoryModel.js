const { default: mongoose } = require("mongoose");

class categoryModel {
    constructor() {
        this.schema = new mongoose.Schema({
            name: { type: String, required: true },
            alias: { type: String, required: true, unique: true },
        })
        this.Category = new mongoose.model('category', this.schema)
    }

    Add(data) {
        return this.Category.create(data)
    }

    GetAll() {
        return this.Category.find()
    }

    Deletecategary(id){
        return this.Category.deleteOne({_id : id })
    }

    Update(id, body){
        return this.Category.updateOne({_id: id}, body)
    }
}

const CategoryModel = new categoryModel()
module.exports = CategoryModel