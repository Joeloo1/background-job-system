import dotenv from "dotenv";

dotenv.config();

export const config = {
  Port: process.env.PORT,
  Node_env: process.env.NODE_ENV,
};
