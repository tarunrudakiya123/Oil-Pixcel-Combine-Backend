const { default: mongoose } = require("mongoose");

class AdminProductModel {
  constructor() {
    this.schema = new mongoose.Schema(
      {
        title: { type: String, required: true },
        Brand: { type: String, default: "" },
        alias: { type: String, required: true, unique: true },
        FeatureImages: {
          type: mongoose.Types.ObjectId,
          required: true,
          ref: "tbl_Media",
        },
        RelevantImages: { type: Array, required: true },
        price: { type: Number, required: true },
        description: { type: String, default: null },
        discount: { type: Number, default: null },
        countInStock: { type: Number, default: 0 },
        totalPrice: { type: Number, default: 0 },
        category: {
          type: mongoose.Types.ObjectId,
          required: true,
          ref: "category",
        },
      },
      { timestamps: true }
    );
    this.Product = new mongoose.model("Products_Data", this.schema);
  }

  AddProduct(data) {
    return this.Product.create(data);

    // return this.Product.aggregate([
    //     {
    //         $lookup: {
    //             from: "tbl_medias",
    //             localField: "FeatureImages",
    //             foreignField: "_id",
    //             as: "FeatureImages"
    //         }
    //     },
    //     {
    //         $addFields: {
    //             FeatureImages: {
    //                 $map: {
    //                     input: "$FeatureImages",
    //                     as: "image",
    //                     in: {
    //                         url: { $concat: ["https://localhost:5100", "$$image.path"] },
    //                         _id: "$$image._id",
    //                         mimetype: "$$image.mimetype"
    //                     }
    //                 }
    //             }
    //         }
    //     },
    //     {
    //         $unwind: "$FeatureImages",
    //     },

    // ])
  }

  GetProducts() {
    
    return this.Product.find()
      .populate({
        path: "FeatureImages",
        select: "_id mimetype path",
        options: { lean: true },
      })
      .populate({
        path: "category",
        select: "name",
        options: { lean: true },
      });
  }

  GetproductById(id) {
    return this.Product.findOne({ _id: id }).populate({
      path: "FeatureImages",
      select: "_id mimetype path",
      options: { lean: true },
    });
  }

  GetAdminProductByID(id) {
    return this.Product.findOne({ _id: id }).populate({
      path: "FeatureImages",
      select: "_id mimetype path",
      options: { lean: true },
    });
  }

  GetAddToCart(data) {
    return this.Product.find({ _id: { $in: data } })
      .populate({
        path: "FeatureImages",
        select: "_id mimetype path",
        options: { lean: true },
      })
      .populate({
        path: "category",
        select: "name",
        options: { lean: true },
      });
  }

  UpdateProduct(id, body) {
    return this.Product.updateOne({ _id: id }, body);
  }

  DeleteProduct(id) {
    return this.Product.deleteOne({ _id: id });
  }
}
const productModel = new AdminProductModel();
module.exports = productModel;
