const path = require("path");

module.exports = {
  extensions: [".js", ".ts", ".css", ".scss", ".json"],
  // This, in combination with baseUrl in tsconfig, allows imports without doing ../../..etc
  modules: [
    path.resolve("./src"),
    path.resolve("./src/core"),
    path.resolve("./src/core/common"),
    path.resolve("./src/core/@domain"),
    path.resolve("./src/core/application"),
    path.resolve("./node_modules"),
  ],
};
