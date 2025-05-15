import winston from 'winston';
import dotenv from 'dotenv';

dotenv.config();

// Define los niveles de log
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Define los colores para cada nivel
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'blue',
};

// Añade los colores a winston
winston.addColors(colors);

// Define el formato del log
const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}`,
  ),
);

// Define las configuraciones de transporte
const transports = [
  // Consola para desarrollo
  new winston.transports.Console(),
  // Archivo para todos los logs
  new winston.transports.File({
    filename: 'logs/all.log',
  }),
  // Archivo solo para errores
  new winston.transports.File({
    filename: 'logs/error.log',
    level: 'error',
  }),
];

// Crea el logger
export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  levels,
  format,
  transports,
});