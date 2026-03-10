import { prisma } from "./lib/prisma.js";
import app from "./server.js";

["DATABASE_URL", "PORT"].forEach((envVar) => {
  if (!process.env[envVar]) {
    throw new Error(`${envVar} is not defined`);
  }
});

try {
  await prisma.$connect();
  console.log("Database connected");

  app.listen(parseInt(process.env.PORT!), "0.0.0.0", () => {
    console.log(`Server is running on http://localhost:${process.env.PORT}`);
  });
} catch (err) {
  console.error("Database connection failed");
  console.error(err);
  process.exit(1);
}
