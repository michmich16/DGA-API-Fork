import sequelize from "../config/sequelizeConfig.js";
import { DataTypes, Model } from "sequelize";
import { productModel } from "./productModel.js";
import { userModel } from "./userModel.js";

// Definerer en klasse, der udvider Sequelize's Model-klasse
export class favoriteModel extends Model {}

// Initialiserer modellen med felter og deres datatyper
favoriteModel.init(
  {
    // Primær nøgle: Automatisk incrementerende ID
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: userModel,
        key: "id",
      },
    },
    product_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: productModel,
        key: "id",
      },
    },
  },
  {
    sequelize, // Sequelize-forbindelsen
    modelName: "favorite", // Navn på modellen
    timestamps: true, // Tilføjer createdAt og updatedAt felter
    underscored: true, // Bruger underscoring i stedet for camelCase i kolonnenavne
    freezeTableName: true, // Forhindrer Sequelize i at ændre tabelnavnet
  }
);
