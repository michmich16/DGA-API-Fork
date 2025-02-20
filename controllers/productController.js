import express from "express";
import { productModel as model } from "../models/productModel.js";
import { errorResponse, successResponse } from "../utils/responseUtils.js";
import { getQueryLimit, getQueryOrder } from "../utils/apiUtils.js";
import { categoryModel } from "../models/categoryModel.js";
import { userModel } from "../models/userModel.js";
import { Authorize, getUserFromToken } from "../utils/authUtils.js";
import { commentModel } from "../models/commentModel.js";

export const productController = express.Router();

const url = "products";

/***********************************************************
 * Get all products including user it belongs to and category
 ***********************************************************/
productController.get(`/${url}`, async (req, res) => {
  try {
    // Find alle produkter og inkluder kategori og bruger der ejer produktet
    const list = await model.findAll({
      // Begrænser antal records
      limit: getQueryLimit(req.query),

      // Sorterer resultat stigende efter felt
      order: getQueryOrder(req.query),
      include: [
        {
          model: categoryModel,
          as: "category",
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

/**********************************
 * Get products from category slug
 **********************************/
productController.get(`/${url}/category/:slug`, async (req, res) => {
  try {
    // Henter slug fra params
    const { slug } = req.params;

    // Find kategori ud fra slug
    const category = await categoryModel.findOne({ where: { slug: slug } });

    // Hent alle produkter ud fra katogori
    const list = await model.findAll({
      where: { category_id: category.id },
      limit: getQueryLimit(req.query),
      order: getQueryOrder(req.query),
    });
    if (!list || list.length === 0) {
      return errorResponse(res, `No records found`, 404);
    }
    successResponse(res, list, { category: category.name }); // Returnerer succesrespons med listen
  } catch (error) {
    errorResponse(res, `Error fetching records: ${error.message}`); // Håndterer fejl
  }
});

/********************************
 * Get product from product slug
 ********************************/
productController.get(`/${url}/:slug`, async (req, res) => {
  try {
    // Læser ID fra URL
    const { slug } = req.params;

    // Find produkt med slug
    const list = await model.findOne({
      where: { slug: slug },

      // Begrænser antal records
      limit: getQueryLimit(req.query),

      // Sorterer resultat stigende efter felt
      order: getQueryOrder(req.query),
      include: [
        {
          model: categoryModel,
          as: "category",
          attributes: ["name", "id"],
        },
        {
          model: userModel,
          as: "user",
          attributes: ["firstName", "lastName", "email"],
        },
        {
          model: commentModel,
          as: "comments",
          include: [
            {
              model: userModel,
              as: "user",
              attributes: ["firstname", "lastname", "email"],
            },
          ],
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

/*******************************
 * Post new product (Authorized)
 ******************************/
productController.post(`/${url}`, Authorize, async (req, res) => {
  try {
    // Henter data fra request body
    const data = req.body;

    // Hent user id fra token
    const user_id = await getUserFromToken(req, res);

    // Sætter user id
    data.user_id = user_id;

    // Check om et produkt med navnet allerede findes
    const doesNameExist = await model.findAll({ where: { name: data.name } });

    // Hvis det gør skal slug have appendet et ekstra tal på enden
    if (doesNameExist) {
      data.slug =
        data.name.replaceAll(" ", "-").toLowerCase() +
        "-" +
        doesNameExist.length;
    } else {
      // Ellers oprettes slug ud fra titel
      data.slug = data.name.replaceAll(" ", "-").toLowerCase();
    }

    // Opretter en ny record
    const result = await model.create(data);

    // Returnerer succesrespons
    successResponse(res, result, `Record created`, 201);
  } catch (error) {
    // Håndterer fejl
    errorResponse(res, `Error creating record: ${error.message}`);
  }
});

/**********************
 * Update product
 **********************/
productController.patch(`/${url}/:id`, Authorize, async (req, res) => {
  try {
    // Læser ID fra TOKEN
    const user_id = await getUserFromToken(req, res);

    // Henter data fra request body
    const data = req.body;

    // Hent product id fra params
    const { id } = req.params;

    // Sætter user id på data
    data.user_id = user_id;

    // Opdater slug til det nye navn
    data.slug = data.name.replace(" ", "-").toLowerCase();

    // Opdaterer record
    const [updated] = await model.update(data, {
      where: { id: id, user_id: user_id },
      individualHooks: true, // Åbner for hooks i modellen
    });
    // Fejl hvis ingen record findes
    if (!updated)
      return errorResponse(
        res,
        `No product found with ID: ${id}. Make sure you are updating a product that belongs to you`,
        404
      );
    // Returnerer succesrespons
    successResponse(res, { user_id, ...data }, `Product updated successfully`);
  } catch (error) {
    // Håndterer fejl
    errorResponse(res, `Error updating product: ${error}`, error);
  }
});
/***************************
 * Delete a product from id
 ***************************/
productController.delete(`/${url}/:id`, Authorize, async (req, res) => {
  try {
    // Hent data fra body
    const data = req.body;

    // Hent product id fra params
    const { id } = req.params;

    // Hent user_id fra Token
    const user_id = await getUserFromToken(req, res);

    // Sletter produkt hvor ID og bruger ID er til stede
    const deletedProduct = await model.destroy({
      where: { id: id, user_id: user_id },
    });

    // Hvis ikke deleted product findes så send en error
    if (!deletedProduct) {
      return errorResponse(
        res,
        `Could not delete product. Make sure you are deleting a product that exists and belongs to you`,
        301
      );
    }
    // Returner success besked
    successResponse(res, { ...data }, `Product deleted succesfully`);
  } catch (error) {
    // Returner error besked
    return errorResponse(
      res,
      `Could not delete product. Error: ${error}`,
      error
    );
  }
});
