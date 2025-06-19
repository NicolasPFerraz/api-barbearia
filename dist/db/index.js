"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.pool = void 0;
exports.testDbConnection = testDbConnection;
const pg_1 = require("pg");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.pool = new pg_1.Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});
// Função para testar e exibir status da conexão com o banco
function testDbConnection() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield exports.pool.query('SELECT 1');
            console.log('\x1b[32m%s\x1b[0m', '✅ Conexão com o banco de dados Neon estabelecida com sucesso!');
        }
        catch (error) {
            console.error('\x1b[31m%s\x1b[0m', '❌ Erro ao conectar no banco de dados Neon:', error);
            process.exit(1);
        }
    });
}
