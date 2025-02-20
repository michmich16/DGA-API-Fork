import express from "express";
import { categoryModel as model } from "../models/categoryModel.js";
import { errorResponse, successResponse } from "../utils/responseUtils.js";
import { getQueryLimit, getQueryOrder } from "../utils/apiUtils.js";

export const categoryController = express.Router();

const url = "categories";

categoryController.get(`/${url}`, async (req, res) => {
  try {
    const list = await model.findAll({
      // Begrænser antal records
      limit: getQueryLimit(req.query),
      // Sorterer resultat stigende efter felt
      order: getQueryOrder(req.query),
    });
    if (!list || list.length === 0) {
      return errorResponse(res, `No records found`, 404);
    }
    successResponse(res, list); // Returnerer succesrespons med listen
  } catch (error) {
    errorResponse(res, `Error fetching records: ${error.message}`); // Håndterer fejl
  }
});
