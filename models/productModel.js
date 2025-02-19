import sequelize from "../config/sequelizeConfig.js";
import { DataTypes, Model } from "sequelize";
import { categoryModel } from "./categoryModel.js";
import { userModel } from "./userModel.js";

export class productModel extends Model {}

productModel.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    image: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    price: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    slug: {
      type: DataTypes.STRING,
    },
    category_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: categoryModel,
        key: "id",
      },
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: userModel,
        key: "id",
      },
    },
  },
  {
    sequelize, // Sequelize-forbindelsen
    modelName: "product", // Navn på modellen
    timestamps: true, // Tilføjer createdAt og updatedAt felter
    underscored: true, // Bruger underscoring i stedet for camelCase i kolonnenavne
    freezeTableName: true, // Forhindrer Sequelize i at ændre tabelnavnet
  }
);
