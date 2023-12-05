const express = require("express");
const router = express.Router();
const { auth } = require("../../middlewares/auth"); 
const controller = require("../../controllers");

router.get("/contacts", controller.get);
router.get("/contacts/:contactId", controller.getById);
router.post("/contacts", controller.create);
router.delete("/contacts/:contactId", controller.remove);
router.put("/contacts/:contactId", controller.change);
router.patch("/contacts/:contactId/favorite", controller.update);


router.get("/users", controller.getUsers); 
router.post("/users/signup", controller.userSignup);
router.post("/users/login", controller.userLogin);
router.get("/users/logout", auth ,controller.userLogout);
router.get("/users/current", auth, controller.currentUser);
router.patch("/users/:userId/subscription",  auth,  controller.updateSubscription);


module.exports = router;
