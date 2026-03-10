import express from "express";
import fornecedorRoute from "./routes/fornecedor.js";
import cndRoute from "./routes/cnd.js";

import cors from "cors";

var app = express();
app.use(express.json());
app.use(cors());
app.set("query parser", "extended");

app.use((req, res, next) => {
  console.log({
    method: req.method,
    url: req.originalUrl,
    query: req.query,
    body: req.body,
  });
  next();
});

app.use("/public", express.static("public"));
app.use("/fornecedor", fornecedorRoute);
app.use("/cnd", cndRoute);

export default app;
