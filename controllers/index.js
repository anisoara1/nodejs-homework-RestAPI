const services = require("../services/index");
const jwt = require("jsonwebtoken");




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

 



const getUsers = async (req, res,next) => {
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


/* const getContactsController = async (req, res, next) => {
  try {
    const results = await services.getContacts();

    res.json({
      status: "Success",
      code: 200,
      data: results,
    });
  } catch (error) {
    res.status(404).json({
      status: 404,
      code: 404,
    });
    next(error);
  }
}; */

const userSignup = async (req, res) => {
  const { email, password } = req.body;
  try {
    const result = await services.createUser({
      email,
      password,
    });
    const payload = { id: result.id, email: result.email, subscription:result.subscription };
    const token = jwt.sign(payload, secret, { expiresIn: "1h" });
    await services.updateUser(result.id, { token });
    res.status(201).json({
      status: "succes",
      code: 201,
      data: { email: result.email, token },
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
    const payload = { id: result.id, email: result.email, subscription:result.subscription };
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
  const { subscription} = req.body;
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
    const result = await services.userName({ email: user.email },{subscription:user.subscription});
    console.log(result);
    if (result) {
      res.status(200).json({
        status: "success",
        code: 200,
        data: { name: result.name, subscription:user.subscription },
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
  currentUser
}; 





