const requireAPI = api => require("../API/" + api );

module.exports = {
  "/graphql": requireAPI("graphql"),
  "/calcMatch": requireAPI("calcMatch")
};
