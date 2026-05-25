"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
const client_1 = require("@prisma/client");
const globalForPrisma = globalThis;
exports.prisma = globalForPrisma.prisma ??
    new client_1.PrismaClient({
        log: process.env.PRISMA_LOG ? ['query', 'error', 'warn'] : ['error'],
    });
globalForPrisma.prisma = exports.prisma;
//# sourceMappingURL=prisma.js.map