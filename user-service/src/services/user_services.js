const UsersModel = require("../models/user_model.js");
const bcrypt = require("bcrypt");

function success(data) {
  return { status: 200, data };
}

function created(data) {
  return { status: 201, data };
}

function error(msg, status = 400) {
  return { status, data: { error: msg } };
}

const UserService = {
  register: async (data) => {
    const { email, password, name } = data;

    // 1) preverjanje osnovnih polj
    if (!email || !password) {
        return error("Email and password are required", 400);
    }

    // 2) preveri, če user že obstaja
    const existing = await UsersModel.findByEmail(email);
    if (existing) {
        return error("User with this email already exists", 400);
    }

    // 3) hash gesla
    const hashed = await bcrypt.hash(password, 10);

    // 4) ustvari novega userja
    const newUser = await UsersModel.create({
        email,
        password: hashed,
        name: name || null,
        role: "user"
    });

    return created(newUser);
    },


  login: async (data) => {
    const { email, password } = data;

    if (!email || !password) {
        return error("Email and password are required", 400);
    }

    // 1) preveri, če uporabnik obstaja
    const user = await UsersModel.findByEmail(email);
    if (!user) {
        return error("User not found", 404);
    }

    // 2) preveri geslo
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        return error("Invalid password", 401);
    }

    // 3) uspeh
    return success({
        message: "Login successful",
        userId: user.id,
        role: user.role
    });
    },


  getAll: async () => {
    const users = await UsersModel.getAll();
    return success(users);
  },

  getById: async (id) => {
    const user = await UsersModel.getById(id);
    if (!user) return error("User not found", 404);
    return success(user);
  },

  getRole: async (id) => {
    const user = await UsersModel.getRole(id);
    if (!user) return error("User not found", 404);
    return success({ role: user.role });
  },

  update: async (id, data) => {
    const user = await UsersModel.getById(id);
    if (!user) {
        return error("User not found", 404);
    }

    // Dovolimo posodobiti samo name ali email
    const { name, email } = data;

    if (!name && !email) {
        return error("Nothing to update", 400);
    }

    // če spreminja email, preveri ali je že zaseden
    if (email) {
        const existing = await UsersModel.findByEmail(email);
        if (existing && existing.id != id) {
            return error("Email already in use", 400);
        }
    }

    const updated = await UsersModel.update(id, { name, email });
    return success(updated);
    },


  updateRole: async (id, role) => {
    // 1) preveri, ali user obstaja
    const user = await UsersModel.getById(id);
    if (!user) {
        return error("User not found", 404);
    }

    // 2) preveri, ali je role poslan
    if (!role) {
        return error("Role is required", 400);
    }

    // 3) preveri, ali je role dovoljena
    const allowedRoles = ["user", "merchant"];
    if (!allowedRoles.includes(role)) {
        return error("Invalid role", 400);
    }

    // 4) če je že merchant, ni treba posodabljati
    if (user.role === role) {
        return error("User already has this role", 400);
    }

    // 5) posodobi v bazi
    const updated = await UsersModel.updateRole(id, role);

    return success({
        id: updated.id,
        email: updated.email,
        name: updated.name,
        role: updated.role
    });
    },


  delete: async (id) => {
    // 1) preveri, ali user obstaja
    const user = await UsersModel.getById(id);
    if (!user) {
        return error("User not found", 404);
    }

    // 2) izbriši uporabnika
    await UsersModel.delete(id);

    return success({ message: "User deleted" });
    },


  clearSessions: async (id) => {
    const user = await UsersModel.getById(id);
    if (!user) {
        return error("User not found", 404);
    }

    // Ko bo JWT -> tu zbrišemo token
    return success({ message: "Sessions cleared" });
    },


  searchByEmail: async (email) => {
    if (!email) {
        return error("Email query parameter is required", 400);
    }

    const user = await UsersModel.findByEmail(email);
    if (!user) {
        return error("User not found", 404);
    }

    return success({
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
    });
    },

};

module.exports = UserService;
