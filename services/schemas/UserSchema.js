const mongoose = require("mongoose");
const bCrypt = require("bcryptjs");
const gravatar = require("gravatar");

const Schema = mongoose.Schema;

const userSchema = new Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
  },
    password: {
      type: String,
      required: [true, 'Password is required'],
    },
    avatarUrl: {
      type: String,
  },
    subscription: {
      type: String,
      enum: ["starter", "pro", "business"],
      default: "starter"
    },
    token: {
      type: String,
      default: null,
    },

});

userSchema.methods.setPassword = function (password) {
  console.log(this);
  this.password = bCrypt.hashSync(password, bCrypt.genSaltSync(6));
};


userSchema.methods.validPassword = function (password) {
  return bCrypt.compareSync(password, this.password);
};

userSchema.pre("save", function (next) {
  if (!this.avatarUrl) {
    this.avatarUrl = gravatar.url(
      this.email,
      {
        s: 200,
        r: "pg",
        d: "identicon",
      },
      true
    );
  }
  next();
});

const User = mongoose.model("users", userSchema);

module.exports = User;