import express from "express";
import { categoryModel as model } from "../models/categoryModel.js";
import { errorResponse, successResponse } from "../utils/responseUtils.js";
import {
  getQueryAttributes,
  getQueryLimit,
  getQueryOrder,
} from "../utils/apiUtils.js";
import { productModel } from "../models/productModel.js";

export const categoryController = express.Router();

const url = "categories";

categoryController.get(`/${url}`, async (req, res) => {
  try {
    const list = await model.findAll({
      //attributes: ["name", "price"],
      //attributes: getQueryAttributes(req.query, "name, price"),
      // Begrænser antal records
      limit: getQueryLimit(req.query),
      // Sorterer resultat stigende efter felt
      order: getQueryOrder(req.query),

      /*   include: [
        {
          model: productModel,
          // Bruger aliaset 'products' som defineret i relationsopsætningen
          as: "products",
          // Begrænser felter fra productModel
          attributes: ["name", "id"],
        },
      ], */
    });
    if (!list || list.length === 0) {
      return errorResponse(res, `No records found`, 404);
    }
    successResponse(res, list); // Returnerer succesrespons med listen
  } catch (error) {
    errorResponse(res, `Error fetching records: ${error.message}`); // Håndterer fejl
  }
});
