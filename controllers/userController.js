import express from "express";
import { userModel as model } from "../models/userModel.js";
import { errorResponse, successResponse } from "../utils/responseUtils.js";
import { Authorize, getUserFromToken } from "../utils/authUtils.js";
import { favoriteModel } from "../models/favoriteModel.js";
import { getQueryAttributes, getQueryOrder } from "../utils/apiUtils.js";
import { productModel } from "../models/productModel.js";

export const userController = express.Router();
const url = "users";

/**
 * READ: Fetch a single record by JWT
 */
userController.get(`/${url}`, Authorize, async (req, res) => {
  try {
    // Læser ID fra TOKEN
    const user_id = await getUserFromToken(req, res);

    let details = await model.findOne({
      attributes: ["firstname", "lastname", "email", "id"],
      //order: getQueryOrder(req.query),
      where: { id: user_id },
      include: [
        {
          model: favoriteModel,
          // Bruger aliaset 'favorites' som defineret i relationsopsætningen
          as: "favorites",
          // Begrænser felter fra favoriteModel
          attributes: ["product_id"],
        },
        {
          model: productModel,
          as: "products",
        },
      ],
    });

    if (!details) return errorResponse(res, `User not found`, 404);

    successResponse(res, details);
  } catch (error) {
    errorResponse(res, `Error fetching User details: ${error.message}`);
  }
});

/**
 * CREATE: Add a new record to the database
 */
userController.post(`/${url}`, async (req, res) => {
  try {
    // Henter data fra request body
    const data = req.body;

    let doesExist = await model.findOne({ where: { email: data.email } });
    if (doesExist) {
      errorResponse(res, "Error: User already exists");
    } else {
      // Opretter en ny record
      const result = await model.create(data);
      // Returnerer succesrespons
      successResponse(
        res,
        {
          firstName: result.firstname,
          lastName: result.lastname,
          email: result.email,
          id: result.id,
        },
        `User created successfully`,
        201
      );
    }
  } catch (error) {
    // Håndterer fejl
    errorResponse(res, `Error creating user`, error);
  }
});

/**
 * UPDATE: Update an existing record
 */
userController.put(`/${url}`, Authorize, async (req, res) => {
  try {
    // Læser ID fra TOKEN
    const user_id = await getUserFromToken(req, res);
    // Henter data fra request body
    const data = req.body;
    // Opdaterer record

    const [updated] = await model.update(data, {
      where: { id: user_id },
      individualHooks: true, // Åbner for hooks i modellen
    });
    // Fejl hvis ingen record findes
    if (!updated)
      return errorResponse(res, `No user found with ID: ${id}`, 404);
    // Returnerer succesrespons
    successResponse(res, { user_id, ...data }, `User updated successfully`);
  } catch (error) {
    // Håndterer fejl
    errorResponse(res, `Error updating user`, error);
  }
});

/**
 * DELETE: Remove a record by ID
 */
userController.delete(`/${url}`, Authorize, async (req, res) => {
  try {
    // Læser ID fra TOKEN
    const user_id = await getUserFromToken(req, res);

    // Delete sequence
    const deletedFavorites = await favoriteModel.destroy({
      where: { user_id: user_id },
    });
    const deletedProducts = await productModel.destroy({
      where: { user_id: user_id },
    });
    const deletedUser = await model.destroy({ where: { id: user_id } });

    // Check if user, products and favorites are deleted
    if (!deletedUser || !deletedProducts || !deletedFavorites)
      return errorResponse(res, `No user found with ID: ${user_id}`, 404);

    successResponse(
      res,
      null,
      `User and related products deleted successfully`
    );
  } catch (error) {
    errorResponse(res, `Error deleting user: ${error.message}`);
  }
});
