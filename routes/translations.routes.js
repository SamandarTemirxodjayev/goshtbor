const {Router} = require("express");
const translationController = require("../controllers/translations.controller.js");
const router = Router();

router.get("/", translationController.getAll);
router.get("/:lang", translationController.findByLang);
router.get("/search/:message", translationController.search);
router.post("/:lang", translationController.create);
router.put("/:id", translationController.update);

module.exports = router;
