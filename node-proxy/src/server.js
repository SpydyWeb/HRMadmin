const { PORT } = require("./config");
const app = require("./app");

app.listen(PORT, () => {
  console.log(`Node Proxy running on port ${PORT}`);
});
