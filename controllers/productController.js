import express from "express";
import { productModel as model } from "../models/productModel.js";
import { errorResponse, successResponse } from "../utils/responseUtils.js";
import {
  getQueryAttributes,
  getQueryLimit,
  getQueryOrder,
} from "../utils/apiUtils.js";
import { categoryModel } from "../models/categoryModel.js";
import { userModel } from "../models/userModel.js";

export const productController = express.Router();

const url = "products";

productController.get(`/${url}`, async (req, res) => {
  try {
    const list = await model.findAll({
      //attributes: ["name", "price"],
      //attributes: getQueryAttributes(req.query, "name, price"),
      // Begrænser antal records
      limit: getQueryLimit(req.query),
      // Sorterer resultat stigende efter felt
      order: getQueryOrder(req.query),
      include: [
        {
          model: categoryModel,
          // Bruger aliaset 'category' som defineret i relationsopsætningen
          as: "category",
          // Begrænser felter fra userModel
          attributes: ["name", "id"],
        },
        {
          model: userModel,
          as: "user",
          attributes: ["firstName", "lastName", "email"],
        },
      ],
    });
    if (!list || list.length === 0) {
      return errorResponse(res, `No records found`, 404);
    }
    successResponse(res, list); // Returnerer succesrespons med listen
  } catch (error) {
    errorResponse(res, `Error fetching records: ${error.message}`); // Håndterer fejl
  }
});
