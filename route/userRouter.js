const router = require("express").Router();
const controller = require("../controller/authController");

router.route("/signup").post(controller.signup);
router.route("/forgot").post(controller.forgotPassword);
router.route("/reset/:token").patch(controller.resetPassword);

router.route("/getuser").get(controller.restrict, controller.getAllUsers);

router
  .route("/delete")
  .delete(
    controller.restrict,
    controller.adminCheck("admin"),
    controller.delete
  );

router.route("/login").post(controller.login);

module.exports = router;
