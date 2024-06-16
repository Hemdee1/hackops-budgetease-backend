import express from "express";
import * as userController from "./userController";
import { checkAuthUser } from "../mildleware/auth";

const router = express.Router();

router.get("/autologin", checkAuthUser, userController.autoLogin);
router.get("/", userController.getAllUser);
router.get("/:id", userController.getUser);

router.post("/signup", userController.signUp);
router.post("/login", userController.logIn);
router.post("/logout", userController.logOut);

router.post("/update", checkAuthUser, userController.updateProfile);

router.post("/verify-email/:token", userController.verifyEmail);
router.post("/send-password-link", userController.sendPasswordLink);
router.post("/reset-password/:token", userController.resetPassword);

export default router;
