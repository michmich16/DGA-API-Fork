import { userModel } from "./userModel.js";
import { productModel } from "./productModel.js";
import { categoryModel } from "./categoryModel.js";
import { commentModel } from "./commentModel.js";

export const setRelations = () => {
  // Product / Category relation
  productModel.belongsTo(categoryModel, {
    foreignKey: "category_id",
    as: "category",
  });
  categoryModel.hasMany(productModel, {
    foreignKey: "category_id",
    as: "products",
  });

  // User / Product relation
  productModel.belongsTo(userModel, { foreignKey: "user_id", as: "user" });
  userModel.hasMany(productModel, { foreignKey: "user_id", as: "products" });

  // Comment / User relation
  commentModel.belongsTo(userModel, { foreignKey: "user_id", as: "user" });
  userModel.hasMany(commentModel, { foreignKey: "user_id", as: "comments" });

  // Comment / product relation
  commentModel.belongsTo(productModel, {
    foreignKey: "product_id",
    as: "product",
  });
  productModel.hasMany(commentModel, {
    foreignKey: "product_id",
    as: "comments",
  });
};
