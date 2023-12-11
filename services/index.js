const Contact = require("./schemas/ContactSchema");
const User = require("./schemas/UserSchema");
const sgMail = require("@sendgrid/mail");

const getContacts = async () => {
  return Contact.find();
};

const getContactById = async (id) => {
  console.log(id);
  return Contact.findById(id);
};

const createContact = async ({ name, email, phone, favorite = false }) => {
  return Contact.create({ name, email, phone, favorite });
};

const deleteContact = async (id) => {
  return Contact.findByIdAndDelete(id);
};

const changeContact = async (id, { name, email, phone }) => {
  return Contact.findByIdAndUpdate(id, { name, email, phone }, { new: true });
};

const updateContact = async (id, favoriteUpdate) => {
  console.log(id, favoriteUpdate);
  console.log(favoriteUpdate);
  return Contact.findByIdAndUpdate(
    { _id: id },
    { $set: favoriteUpdate },
    { new: true }
  );
};

const getUsers = async () => {
  return User.find();
};

const createUser = async ({ email, password }) => {
  try {
    const userExistent = await User.findOne({ email });

    if (userExistent) {
      throw new Error("Acest email exista deja.");
    }

    const codUnicDeVerificare = String(Date.now());

    const msg = {
      to: email,
      from: "todea.anisoara@gmail.com",
      subject: "Email de verificare cont!",
      text: `Codul de verificare este ${codUnicDeVerificare} / http://localhost:3000/api/account/verify/${codUnicDeVerificare}`,
    };

    sgMail
      .send(msg)
      .then(() => console.log("Email trimis"))
      .catch(() => {
        throw new Error("Eroare la trimitere");
      });

    const newUser = new User({
      email,
      password,
      verificationToken: codUnicDeVerificare,
    });
    newUser.setPassword(password);
    return await newUser.save();
  } catch (error) {
    console.log(error);
  }
};

const userExists = async ({ email, password }) => {
  try {
    console.log(`Parola:${password}`);
    const user = await User.findOne({ email });

    // if (!user) {
    //   throw new Error("User-ul nu exista in baza de date!");
    // }
    // if (user.password !== password) {
    //   throw new Error("Parola este gresita");
    // }

    if (!user || !user.validPassword(password)) {
      throw new Error("Email sau parola gresita!");
    }

    if (!user.verify) {
      throw new Error("Trebuie sa iti verifici contul de email");
    }

    return user;
  } catch (error) {
    console.log(error);
  }
};

const updateUser = async (id, token) => {
  console.log(id, token);
  console.log(token);
  return User.findByIdAndUpdate({ _id: id }, { $set: token }, { new: true });
};

const userName = async (user) => {
  const result = await User.findOne(
    { email: user.email },
    { subscription: user.subscription }
  );
  return result;
};

const verifyEmail = async (verificationToken) => {
  const update = { verify: true, verificationToken: null };

  const result = await User.findOneAndUpdate(
    {
      verificationToken,
    },
    { $set: update },
    { new: true }
  );
  console.log(result);
  if (!result) throw new Error("userul nu exista");
};

module.exports = {
  getContacts,
  getContactById,
  createContact,
  deleteContact,
  changeContact,
  updateContact,
  getUsers,
  createUser,
  updateUser,
  userExists,
  userName,
  verifyEmail,
};
