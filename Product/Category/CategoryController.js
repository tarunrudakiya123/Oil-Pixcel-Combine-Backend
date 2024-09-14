const CategoryModel = require("./CategoryModel");

class categoryController {
  async AddCategory(req, res) {
    try {
      const { name, alias } = req.body;
      if (!name) return res.status(400).send({ message: "Missign Name" });
      if (!alias) return res.status(400).send({ message: "Missign Alias" });
      const result = await CategoryModel.Add(req.body);
      if (!result)
        return res.status(400).send({ message: "Somthing Went Wrong" });
      return res.status(200).send({ message: "Success", result });
    } catch (error) {
      return res.status(500).send({ message: "Internal Server Error" });
    }
  }

  async ShowCategory(req, res) {
    try {
      const result = await CategoryModel.GetAll().sort({ creatAt: -1 });
      if (result) return res.status(200).send({ message: "Success", result });
      return res.status(400).send({ message: "Somthing Went Wrong" });
    } catch (error) {
      return res.status(500).send({ message: "Internal Server Error" });
    }
  }

  async UpdateCategory(req, res) {
    try {
      const { id } = req.params;
      const result = await CategoryModel.Update(id, req.body);
      if (result.modifiedCount > 0 || result.matchedCount > 0)
        return res.status(200).send({ message: "Success", result: result });
      return res.status(400).send({ message: "Somthing Went Wrong" });
    } catch (error) {
      return res.status(500).send({ message: "Internal Server Error" });
    }
  }

  async Deletecategary(req, res) {
    try {
      const { id } = req.params;
      const result = await CategoryModel.Deletecategary(id);
      if (result) {
        return res.status(200).send({ message: "Success" });
      } else {
        return res.status(400).send({ message: "Something Went Wrong" });
      }
    } catch (error) {
      console.error(error);
      return res.status(500).send({ message: "Internal Server Error" });
    }
  }
}
const CategoryController = new categoryController();
module.exports = CategoryController;
