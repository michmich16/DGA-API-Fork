import { userModel } from "./userModel.js";
import { productModel } from "./productModel.js";
import { categoryModel } from "./categoryModel.js";
import { favoriteModel } from "./favoriteModel.js";

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

  // User / Favorites relation
  favoriteModel.belongsTo(userModel, { foreignKey: "user_id", as: "user" });
  userModel.hasMany(favoriteModel, { foreignKey: "user_id", as: "favorites" });

  // User / Product relation
  productModel.belongsTo(userModel, { foreignKey: "user_id", as: "user" });
  userModel.hasMany(productModel, { foreignKey: "user_id", as: "products" });

  // Product / favorite relation
  productModel.hasMany(favoriteModel, {
    foreignKey: "product_id",
    as: "favorites",
  });
  favoriteModel.belongsTo(productModel, {
    foreignKey: "product_id",
    as: "product",
  });
};
