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
import { Authorize, getUserFromToken } from "../utils/authUtils.js";
import { favoriteModel } from "../models/favoriteModel.js";

export const productController = express.Router();

const url = "products";
/**
 * Get all products including user it belongs to and category
 */
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
/**
 * Get product from product slug
 */
productController.get(`/${url}/:slug`, async (req, res) => {
  try {
    // Læser ID fra URL
    const { slug } = req.params;
    const list = await model.findOne({
      where: { slug: slug },
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
/**
 * Post new product (Authorized)
 */
productController.post(`/${url}`, Authorize, async (req, res) => {
  try {
    // Henter data fra request body
    const data = req.body;
    // Hent user id fra token
    const user_id = await getUserFromToken(req, res);
    // Sætter user id
    data.user_id = user_id;
    // Opretter slug ud fra titel
    data.slug = data.name.replace(" ", "-").toLowerCase();
    // Opretter en ny record
    const result = await model.create(data);
    // Returnerer succesrespons
    successResponse(res, result, `Record created`, 201);
  } catch (error) {
    // Håndterer fejl
    errorResponse(res, `Error creating record: ${error.message}`);
  }
});
/**
 * Update product
 */
productController.put(`/${url}`, Authorize, async (req, res) => {
  try {
    // Læser ID fra TOKEN
    const user_id = await getUserFromToken(req, res);
    // Henter data fra request body
    const data = req.body;
    // Sætter user id på data
    data.user_id = user_id;
    // Opdater slug til det nye navn
    data.slug = data.name.replace(" ", "-").toLowerCase();
    // Opdaterer record
    const [updated] = await model.update(data, {
      where: { id: data.id, user_id: user_id },
      individualHooks: true, // Åbner for hooks i modellen
    });
    // Fejl hvis ingen record findes
    if (!updated)
      return errorResponse(res, `No product found with ID: ${id}`, 404);
    // Returnerer succesrespons
    successResponse(res, { user_id, ...data }, `Product updated successfully`);
  } catch (error) {
    // Håndterer fejl
    errorResponse(res, `Error updating product: ${error}`, error);
  }
});
/**
 * Delete a product from id
 */
productController.delete(`/${url}`, Authorize, async (req, res) => {
  try {
    // Hent data fra body
    const data = req.body;
    // Hent user_id fra Token
    const user_id = await getUserFromToken(req, res);
    // Delete favorites attached to product and user
    const deletedFavorites = await favoriteModel.destroy({
      where: { product_id: data.id },
    });
    // Delete product
    const deletedProduct = await model.destroy({
      where: { id: data.id, user_id: user_id },
    });
    if (!deletedFavorites || !deletedProduct) {
      return errorResponse(
        res,
        `Could not delete product. Make sure you are deleting a product that belongs to you`,
        301
      );
    }
    // Return success message
    successResponse(res, { ...data }, `Product deleted succesfully`);
  } catch (error) {
    // Return error message
    return errorResponse(
      res,
      `Could not delete product. Error: ${error}`,
      error
    );
  }
});
