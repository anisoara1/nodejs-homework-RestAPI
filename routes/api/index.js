const express = require("express");
const router = express.Router();
const { auth } = require("../../middlewares/auth"); 
const controller = require("../../controllers");
const multer = require("multer");
const path = require("path");



const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/avatars");
  },
  filename: function (req, file, cb) {
    console.log(file)
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

const upload = multer({ storage: storage, fileFilter: fileFilter });

router.get("/", (req, res) => {
  res.status(200).json({ message: "API is running" });
});

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
router.patch("/users/avatars", auth,  upload.single("avatar"), controller.updateAvatar);


module.exports = router;
