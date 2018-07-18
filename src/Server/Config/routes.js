const requireAPI = api => require("../API/" + api );

module.exports = {
  "/graphql": {
    api: requireAPI("graphql"),
    method: "use"
  },
  "/calcMatch": requireAPI("calcMatch")
};
