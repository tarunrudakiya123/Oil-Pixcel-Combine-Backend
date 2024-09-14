const express = require("express")
const mediaController = require("./Media/MediaController")
const adminUserController = require("./AdminUser/AdminUserController")
const fileUpload = require("express-fileupload")
const productController = require("../Product/ProductController")
const CategoryController = require("../Product/Category/CategoryController")
const AdminRouter = express.Router()

AdminRouter.use(fileUpload())

AdminRouter.post("/upload", mediaController.GetMedia)

AdminRouter.post("/adduser", adminUserController.CreateAdminUser)

AdminRouter.post("/login", adminUserController.AdminLogin)

AdminRouter.get("/getuser", adminUserController.GetAdminUser)

AdminRouter.delete("/dltuser/:id", adminUserController.DeleUser)

AdminRouter.put("/upuser/:id", adminUserController.UpdateUser)

AdminRouter.post("/verify", adminUserController.OtpVerfy)

AdminRouter.get("/showmedia", mediaController.ShowMedia)

AdminRouter.post("/insertproduct", productController.InsertProducts)

AdminRouter.get('/getproduct', productController.GETProducts)

AdminRouter.put("/updateproduct/:id", productController.UpdateProduct)

AdminRouter.post('/editproduct/:id', productController.GetProductbyId)

AdminRouter.delete('/dltproduct/:id', productController.DeleteProduct)

AdminRouter.post('/addcategory', CategoryController.AddCategory)

AdminRouter.get('/getcategory' , CategoryController.ShowCategory)

AdminRouter.delete('/deletecategary/:id', CategoryController.Deletecategary)

AdminRouter.put("/updatecategory/:id", CategoryController.UpdateCategory)

module.exports = AdminRouter

