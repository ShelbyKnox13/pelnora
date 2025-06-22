export const config = {
  port: 5051,
  database: {
    host: 'localhost',
    port: 5432,
    database: 'pelnora',
    username: 'postgres',
    password: 'admin',
  },
  jwt: {
    secret: 'your-secret-key',
    expiresIn: '1d',
  },
}; 