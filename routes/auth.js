var express = require("express");
var router = express.Router();
let userController = require("../controllers/users");
let bcrypt = require("bcrypt");
let jwt = require("jsonwebtoken");
let fs = require("fs");
const { CheckLogin, SignToken } = require("../utils/authHandler");

router.post("/register", async function (req, res, next) {
  try {
    let { username, password, email } = req.body;
    let newUser = await userController.CreateAnUser(
      username,
      password,
      email,
      "69b0ddec842e41e8160132b8",
    );
    res.send(newUser);
  } catch (error) {
    res.status(404).send(error.message);
  }
});
router.post("/login", async function (req, res, next) {
  try {
    let { username, password } = req.body;
    let user = await userController.GetAnUserByUsername(username);
    if (!user) {
      res.status(404).send({
        message: "thong tin dang nhap sai",
      });
      return;
    }
    if (user.lockTime > Date.now()) {
      res.status(404).send({
        message: "ban dang bi ban",
      });
      return;
    }
    if (bcrypt.compareSync(password, user.password)) {
      loginCount = 0;
      await user.save();
      let token = SignToken(user._id);
      res.send(token);
    } else {
      user.loginCount++;
      if (user.loginCount == 3) {
        user.loginCount = 0;
        user.lockTime = Date.now() + 3600 * 1000;
      }
      await user.save();
      res.status(404).send({
        message: "thong tin dang nhap sai",
      });
    }
  } catch (error) {
    res.status(404).send({
      message: error.message,
    });
  }
});
router.get("/me", CheckLogin, function (req, res, next) {
  res.send(req.user);
});

router.post("/changepassword", CheckLogin, async function (req, res, next) {
  try {
    const { oldpassword, newpassword } = req.body;

    // Validate input
    if (!oldpassword || !newpassword) {
      res.status(400).send({
        message: "oldpassword va newpassword khong duoc de trong",
      });
      return;
    }

    // Validate newpassword strength
    const invalidReasons = [];
    if (newpassword.length < 8) invalidReasons.push("it nhat 8 ki tu");
    if (!/[a-z]/.test(newpassword))
      invalidReasons.push("it nhat 1 ki tu thuong");
    if (!/[A-Z]/.test(newpassword))
      invalidReasons.push("it nhat 1 ki tu in hoa");
    if (!/[0-9]/.test(newpassword)) invalidReasons.push("it nhat 1 ki tu so");
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(newpassword))
      invalidReasons.push("it nhat 1 ki tu dac biet");

    if (invalidReasons.length > 0) {
      res.status(400).send({
        message: `newpassword phai co: ${invalidReasons.join(", ")}`,
      });
      return;
    }

    // Check if newpassword is same as oldpassword
    if (oldpassword === newpassword) {
      res.status(400).send({
        message: "newpassword khong duoc giong oldpassword",
      });
      return;
    }

    // Verify old password
    const user = req.user;
    if (!bcrypt.compareSync(oldpassword, user.password)) {
      res.status(401).send({
        message: "oldpassword khong chinh xac",
      });
      return;
    }

    // Update password
    user.password = newpassword;
    await user.save();

    res.send({
      message: "Doi mat khau thanh cong",
    });
  } catch (error) {
    res.status(500).send({
      message: error.message,
    });
  }
});

module.exports = router;
