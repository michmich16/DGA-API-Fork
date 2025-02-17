import express from "express";
import sequelize from "../config/sequelizeConfig.js";
import { seedFromCsv } from "../utils/seedUtils.js";
import { userModel } from "../models/userModel.js";
import { productModel } from "../models/productModel.js";
import { categoryModel } from "../models/categoryModel.js";
import { errorResponse, successResponse } from "../utils/responseUtils.js";
import { favoriteModel } from "../models/favoriteModel.js";

export const dbController = express.Router();

// Test database connection
dbController.get("/test", async (req, res) => {
  try {
    await sequelize.authenticate();
    successResponse(res, "", "Database connection successful");
  } catch (error) {
    errorResponse(res, "Could not connect to the database");
  }
});

// Synchronize database tables
dbController.get("/sync", async (req, res) => {
  try {
    const forceSync = req.query.force === "true";
    await sequelize.sync({ force: forceSync });
    successResponse(
      res,
      "",
      `Database synchronized ${forceSync ? "with force" : "without force"}`
    );
  } catch (error) {
    errorResponse(res, `Synchronize failed!`, error);
  }
});

// Seed database from CSV files
dbController.get("/seedfromcsv", async (req, res) => {
  try {
    // Array med seed filer og models
    const files_to_seed = [
      { file: "user.csv", model: userModel },
      { file: "category.csv", model: categoryModel },
      { file: "product.csv", model: productModel },
      { file: "favorite.csv", model: favoriteModel },
    ];
    // Array til svar
    const files_seeded = [];

    // Sync'er database
    await sequelize.sync({ force: true });

    // Looper og seeder filer til modeller
    for (let item of files_to_seed) {
      files_seeded.push(await seedFromCsv(item.file, item.model));
    }
    successResponse(
      res,
      { "Files seeded": files_seeded },
      `Seeding completed!`
    );
  } catch (error) {
    errorResponse(res, `Seeding failed!`, error);
  }
});
