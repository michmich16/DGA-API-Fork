import express from "express";
import { favoriteModel as model } from "../models/favoriteModel.js";
import { errorResponse, successResponse } from "../utils/responseUtils.js";
import { Authorize, getUserFromToken } from "../utils/authUtils.js";
import { productModel } from "../models/productModel.js";

export const favoriteController = express.Router();

const url = "favorite";

favoriteController.get(`/${url}`, Authorize, async (req, res) => {
  try {
    // Hent user id fra token
    const user_id = await getUserFromToken(req, res);
    // Hent alle favorites fra brugeren og inkluder produkt detaljer for hver favorit
    const favorites = await model.findAll({
      where: { user_id: user_id },
      include: {
        model: productModel,
        as: "product",
      },
    });
    successResponse(res, favorites, "Success", 200);
  } catch (error) {
    return errorResponse(res, `Error fetching favorites: ${error}`, 500);
  }
});

favoriteController.post(`/${url}/:id`, Authorize, async (req, res) => {
  try {
    // Hent produkt id fra params
    const { id } = req.params;
    // Konverter id til integer
    const product_id = parseInt(id);
    // Hent user id fra token
    const user_id = await getUserFromToken(req, res);
    // Check om favorite allerede eksisterer
    const doesFavoriteExist = await model.findOne({
      where: { user_id: user_id, product_id: product_id },
    });

    if (doesFavoriteExist) {
      return errorResponse(
        res,
        "You already added this to your favorites",
        406
      );
    }

    // Opretter en ny record
    const result = await model.create({
      user_id: user_id,
      product_id: product_id,
    });
    successResponse(
      res,
      result,
      `Favorite added to user with user id: ${user_id}`,
      200
    );
  } catch (error) {
    return errorResponse(res, `Error adding favorite: ${error}`, 500);
  }
});

favoriteController.delete(`/${url}/:id`, Authorize, async (req, res) => {
  try {
    // Hent produkt id fra params
    const { id } = req.params;
    // Konverter id til integer
    const product_id = parseInt(id);
    // Hent user id fra token
    const user_id = await getUserFromToken(req, res);
    // Delete favorite
    await model.destroy({
      where: { product_id: product_id, user_id: user_id },
    });
    return successResponse(
      res,
      `Favorite with product id: ${product_id} has been removed.`,
      "Success",
      200
    );
  } catch (error) {
    return errorResponse(res, `Error deleting favorite: ${error}`, 500);
  }
});
