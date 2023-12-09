const services = require("../services/index");
const jwt = require("jsonwebtoken");
const Jimp = require("jimp");
const fs = require("fs");
const path = require("path");
const User = require("../services/schemas/UserSchema");

require("dotenv").config();
const secret = process.env.SECRET;
exports.secret = secret;

const get = async (req, res, next) => {
  try {
    const results = await services.getContacts();
    res.json({
      status: "Success",
      code: 200,
      data: results,
    });
  } catch (error) {
    res.status(404).json({
      status: "error",
      code: 404,
    });
    next(error);
  }
};

const getById = async (req, res, next) => {
  try {
    const { contactId } = req.params;
    const results = await services.getContactById(contactId);
    res.json({
      status: "Success",
      code: 200,
      data: results,
    });
  } catch (error) {
    res.status(404).json({
      status: "error",
      code: 404,
    });
    next(error);
  }
};

const create = async (req, res, next) => {
  try {
    const { name, email, phone, favorite = false } = req.body;
    const results = await services.createContact({
      name,
      email,
      phone,
      favorite,
    });
    res.json({
      status: "Success",
      code: 200,
      data: results,
    });
  } catch (error) {
    res.status(404).json({
      status: "error",
      code: 404,
    });
    next(error);
  }
};

const remove = async (req, res, next) => {
  try {
    const { contactId } = req.params;
    const results = await services.deleteContact(contactId);
    res.json({
      status: "Success",
      code: 200,
      data: results,
    });
  } catch (error) {
    res.status(404).json({
      status: "error",
      code: 404,
    });
    next(error);
  }
};

const change = async (req, res, next) => {
  try {
    const { contactId } = req.params;
    const { name, email, phone } = req.body;
    const results = await services.changeContact(contactId, {
      name,
      email,
      phone,
    });
    res.json({
      status: "Changed",
      code: 202,
      data: results,
    });
  } catch (error) {
    res.status(404).json({
      status: "error",
      code: 404,
    });
    next(error);
  }
};

const update = async (req, res, next) => {
  const { contactId } = req.params;
  const { favorite } = req.body;
  try {
    const result = await services.updateContact(contactId, { favorite });
    console.log(result);
    if (result) {
      res.status(200).json({
        status: "Updated",
        code: 200,
        data: result,
      });
    }
  } catch (error) {
    console.log(error);
    res.status(404).json({
      status: "error",
    });
  }
};

const getUsers = async (req, res, next) => {
  try {
    const results = await services.getUsers();
    res.json({
      status: "Success",
      code: 200,
      data: results,
    });
  } catch (error) {
    res.status(404).json({
      status: "error",
      code: 404,
    });
    next(error);
  }
};

const userSignup = async (req, res) => {
  const { email, password } = req.body;
  try {
    const result = await services.createUser({
      email,
      password,
    });
    const payload = {
      id: result.id,
      email: result.email,
      subscription: result.subscription,
    };
    const token = jwt.sign(payload, secret, { expiresIn: "1h" });
    await services.updateUser(result.id, { token });
    res.status(201).json({
      status: "succes",
      code: 201,
      data: { email: result.email, token, avatarUrl: result.avatarUrl },
    });
  } catch (error) {
    res.status(404).json({
      status: 404,
      error: error.message,
    });
  }
};

const userLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const result = await services.userExists({
      email,
      password,
    });
    const payload = {
      id: result.id,
      email: result.email,
      subscription: result.subscription,
    };
    const token = jwt.sign(payload, secret, { expiresIn: "1h" });
    await services.updateUser(result.id, { token });
    res.status(201).json({
      status: "succes",
      code: 201,
      data: {
        email: result.email,
        token,
      },
    });
  } catch (error) {
    res.status(404).json({
      status: 404,
      error: error.message,
    });
  }
};

const userLogout = async (req, res, next) => {
  const userId = req.user;
  const token = null;
  try {
    const result = await services.updateUser(userId, { token });
    if (result) {
      res.status(404).json({
        status: "updated",
        code: 200,
        data: result,
      });
    }
  } catch (error) {
    console.log(error);
    res.status(404).json({
      status: "error",
    });
  }
};

const updateSubscription = async (req, res, next) => {
  const { userId } = req.params;
  const { subscription } = req.body;
  try {
    const result = await services.updateUser(userId, { subscription });
    console.log(result);
    if (result) {
      res.status(404).json({
        status: "updated",
        code: 200,
        data: result,
      });
    }
  } catch (error) {
    console.log(error);
    res.status(404).json({
      status: "error",
    });
  }
};

const currentUser = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      // Dacă antetul "Authorization" lipsește, returnați o eroare de autentificare
      return res
        .status(401)
        .json({ status: "error", message: "Missing Authorization header" });
    }

    // Extrageți token-ul eliminând prefixul "Bearer "
    const token = authHeader.split(" ")[1];

    // Verificați token-ul utilizând cheia secretă
    const user = jwt.verify(token, secret);
    console.log(user);
    // Continuați cu logica dvs. pentru a găsi utilizatorul și a trimite răspunsul
    const result = await services.userName(
      { email: user.email },
      { subscription: user.subscription }
    );
    console.log(result);
    if (result) {
      res.status(200).json({
        status: "success",
        code: 200,
        data: { name: result.name, subscription: user.subscription },
      });
    } else {
      // Returnați o eroare 404 sau 401 în funcție de situație
      res.status(404).json({ status: "error", message: "User not found" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ status: "error", message: "Server error" });
  }
};
const updateAvatar = async (req, res, next) => {
  console.log("test"); // Se afișează un mesaj de test în consolă.

  try {
    if (!req.file) {
      return res.status(404).json({ error: "Nu exista fisier de incarcat!" });
      // Dacă nu există fișier în cerere, se returnează o eroare 404.
    }

    const uniqFilename = `${req.user._id}-${Date.now()}${path.extname(
      req.file.originalname
    )}`;
    // Se creează un nume unic pentru fișierul de avatar,
    // folosind ID-ul utilizatorului și marcajul de timp.

    const destinationPath = path.join(__dirname, `../tmp/${uniqFilename}`); // Se definește calea de destinație pentru fișierul final de avatar.

    // Utilizează Jimp pentru redimensionare, ajustarea calității și transformare în tonuri de gri
    await Jimp.read(req.file.path)
      .then((image) => {
        return image
          .resize(350, 350)
          .quality(60)
          .greyscale()
          .writeAsync(destinationPath);
        // Se redimensionează, ajustează calitatea și se convertește la tonuri de gri,
        // apoi se salvează în calea de destinație.
      })
      .then(() => {
        fs.unlinkSync(req.file.path);
        // Se șterge fișierul original după redimensionare,
        // ajustare calitate și transformare în tonuri de gri.
      })
      .catch((error) => {
        throw error; // Se aruncă o excepție în caz de eroare în timpul procesării imaginii cu Jimp.
      });

    req.user.avatarUrl = `/avatars/${uniqFilename}`;
    const { userId } = req.params;
    const { avatarURL } = req.body; // Se salvează modificările în obiectul utilizatorului în baza de date.
    // Se actualizează calea avatarului în obiectul utilizatorului.
    await User.findByIdAndUpdate(userId, { avatarURL });
    res.status(200).json({
      status: "success",
      code: 200,
    }); // Se trimite răspunsul HTTP cu URL-ul noului avatar.
  } catch (error) {
    res.status(404).json({ error: error.message }); // Se returnează o eroare 404 în caz de orice altă eroare și se trece la middleware-ul următor în lanț.
    next(error);
  }
};

const verifyEmailController = async (req, res, next) => {
  try {
    const { verificationToken } = req.params;
    console.log(verificationToken);
    await services.verifyEmail(verificationToken);

    res.status(200).json({ mesaj: "Email verificat cu success", code: 200 });
  } catch (error) {
    res.status(404).json({
      status: "error",
      message: error.message,
    });
  }
};

module.exports = {
  get,
  getById,
  create,
  remove,
  change,
  update,
  getUsers,
  userSignup,
  userLogin,
  userLogout,
  updateSubscription,
  currentUser,
  updateAvatar,
  verifyEmailController,
};
