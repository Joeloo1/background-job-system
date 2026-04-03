import dotenv from "dotenv";

dotenv.config();

export const config = {
  Port: Number(process.env.PORT),
  Node_env: process.env.NODE_ENV,
  Redis_Host: process.env.REDIS_HOST,
  Redis_Port: Number(process.env.REDIS_PORT),
  Redis_Password: process.env.REDIS_PASSWORD,
  Redis_db: Number(process.env.REDIS_DB),
  DB: process.env.DATABASE_URL,
  Email_User: process.env.EMAIL_USER,
  Email_Password: process.env.EMAIL_PASS,
  Email_Host: process.env.EMAIL_HOST,
  Email_Port: Number(process.env.EMAIL_PORT),
};
