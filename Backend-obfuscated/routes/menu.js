const express = require("express");
const { getAllMenus, createMenu, deleteMenu } = require("../controllers/menuController");

const router = express.Router({ mergeParams: true });

router.route("/").get(getAllMenus).post(createMenu);
router.route("/:menuId").delete(deleteMenu);

module.exports = router;
