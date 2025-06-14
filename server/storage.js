"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.storage = void 0;
// Export the PostgreSQL storage implementation
var pgStorage_1 = require("./pgStorage");
Object.defineProperty(exports, "storage", { enumerable: true, get: function () { return pgStorage_1.storage; } });
