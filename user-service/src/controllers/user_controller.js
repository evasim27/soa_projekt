const UserService = require("../services/user_services.js");

exports.register = async (req, res) => {
  const result = await UserService.register(req.body);
  res.status(result.status).json(result.data);
};

exports.login = async (req, res) => {
  const result = await UserService.login(req.body);
  res.status(result.status).json(result.data);
};

exports.getAllUsers = async (req, res) => {
  const result = await UserService.getAll();
  res.status(result.status).json(result.data);
};

exports.getUserById = async (req, res) => {
  const result = await UserService.getById(req.params.id);
  res.status(result.status).json(result.data);
};

exports.getUserRole = async (req, res) => {
  const result = await UserService.getRole(req.params.id);
  res.status(result.status).json(result.data);
};

exports.searchByEmail = async (req, res) => {
  const email = req.query.email;
  const result = await UserService.searchByEmail(email);
  res.status(result.status).json(result.data);
};

exports.updateUser = async (req, res) => {
  const result = await UserService.update(req.params.id, req.body);
  res.status(result.status).json(result.data);
};

exports.updateUserRole = async (req, res) => {
  const result = await UserService.updateRole(req.params.id, req.body.role);
  res.status(result.status).json(result.data);
};

exports.deleteUser = async (req, res) => {
  const result = await UserService.delete(req.params.id);
  res.status(result.status).json(result.data);
};

exports.clearSessions = async (req, res) => {
  const result = await UserService.clearSessions(req.params.id);
  res.status(result.status).json(result.data);
};
