import sequelize from '../config/sequelizeConfig.js'
import { DataTypes, Model } from 'sequelize'

// Definerer en klasse, der udvider Sequelize's Model-klasse
export class categoryModel extends Model {}

// Initialiserer modellen med felter og deres datatyper
categoryModel.init(
  {
    // Primær nøgle: Automatisk incrementerende ID
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
    category_image: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    slug: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
  },
  {
    sequelize, // Sequelize-forbindelsen
    modelName: 'category', // Navn på modellen
    timestamps: true, // Tilføjer createdAt og updatedAt felter
    underscored: true, // Bruger underscoring i stedet for camelCase i kolonnenavne
    freezeTableName: true, // Forhindrer Sequelize i at ændre tabelnavnet
    indexes: [
      { unique: true, fields: ['name'] }, // Sikrer unikke værdier i string_field
    ],
  }
)
