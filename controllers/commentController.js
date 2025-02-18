import express from "express";
import { commentModel as model } from "../models/commentModel.js";
import { errorResponse, successResponse } from "../utils/responseUtils.js";
import { Authorize, getUserFromToken } from "../utils/authUtils.js";
import { productModel } from "../models/productModel.js";
import { userModel } from "../models/userModel.js";

export const commentController = express.Router();

const url = "comment";

commentController.get(`/${url}/:id`, Authorize, async (req, res) => {
  try {
    // Hent user id fra token
    const user_id = await getUserFromToken(req, res);

    const { id } = req.params;
    const product_id = parseInt(id);

    // Hent alle favorites fra brugeren og inkluder produkt detaljer for hver favorit
    const comments = await model.findAll({
      where: { product_id: product_id },
      include: {
        model: userModel,
        as: "user",
        attributes: [
          "firstname",
          "lastname",
          "id",
          "email",
          "created_at",
          "updated_at",
        ],
      },
    });
    successResponse(res, comments, "Success", 200);
  } catch (error) {
    return errorResponse(res, `Error fetching favorites: ${error}`, 500);
  }
});

commentController.post(`/${url}`, Authorize, async (req, res) => {
  try {
    const data = req.body;
    // Hent user id fra token
    const user_id = await getUserFromToken(req, res);
    // Append product id and user id to comment data
    data.user_id = user_id;

    // Opretter en ny record
    const comment = await model.create(data);
    successResponse(
      res,
      comment,
      `comment added to product with id: ${data.product_id}`,
      200
    );
  } catch (error) {
    return errorResponse(res, `Error adding favorite: ${error}`, 500);
  }
});

commentController.delete(`/${url}/:id`, Authorize, async (req, res) => {
  try {
    // Hent produkt id fra params
    const { id } = req.params;
    // Konverter id til integer
    const comment_id = parseInt(id);
    // Hent user id fra token
    const user_id = await getUserFromToken(req, res);
    // Delete favorite
    await model.destroy({
      where: { id: comment_id, user_id: user_id },
    });
    return successResponse(
      res,
      `Comment with id: ${comment_id} has been removed.`,
      "Success",
      200
    );
  } catch (error) {
    return errorResponse(res, `Error deleting favorite: ${error}`, 500);
  }
});
