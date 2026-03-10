import { Router } from "express";
import FornecedorManager from "../controllers/fornecedor.js";
import { newFornecedor, queryFornecedor } from "../schemas/fornecedor.js";
import ApiResponseHandler from "../lib/response.js";
import { BaseError } from "../lib/error.js";

const fornecedorRoute = Router();

// POST / - Criar novo fornecedor
fornecedorRoute.post("/", async (req, res) => {
  try {
    const data = await newFornecedor.safeParseAsync(req.body);

    if (!data.success) {
      ApiResponseHandler.validationError(res, data.error);
      return;
    }

    const fornecedor = await FornecedorManager.newFornecedor(
      data.data.cnpj,
      data.data.name,
    );

    ApiResponseHandler.success(res, fornecedor, 201);
  } catch (error) {
    ApiResponseHandler.trycatchHandler(res, error as BaseError);
  }
});

// POST /search - Busca avançada
fornecedorRoute.post("/search", async (req, res) => {
  try {
    const data = await queryFornecedor.safeParseAsync(req.body);

    if (!data.success) {
      ApiResponseHandler.validationError(res, data.error);
      return;
    }

    const fornecedores = await FornecedorManager.getFornecedores(data.data);

    ApiResponseHandler.success(res, fornecedores);
  } catch (error) {
    ApiResponseHandler.trycatchHandler(res, error as BaseError);
  }
});

// GET / - Listar com filtros
fornecedorRoute.get("/", async (req, res) => {
  try {
    const { cnpj, name } = req.query;
    const where: any = {};

    if (cnpj && typeof cnpj === "string") where.cnpj = cnpj;
    if (name && typeof name === "string") where.name = name;

    const fornecedores = await FornecedorManager.getFornecedores({ where });

    ApiResponseHandler.success(res, fornecedores);
  } catch (error) {
    ApiResponseHandler.trycatchHandler(res, error as BaseError);
  }
});

// GET /:id - Buscar por ID
fornecedorRoute.get("/:cnpj", async (req, res) => {
  try {
    const { cnpj } = req.params;
    const limitPerTipo = req.query.limit ? parseInt(req.query.limit as string, 10) : undefined;

    if (limitPerTipo !== undefined && (isNaN(limitPerTipo) || limitPerTipo < 1)) {
      ApiResponseHandler.error(res, "limit deve ser um inteiro positivo", null, 400);
      return;
    }

    const fornecedores = await FornecedorManager.getFornecedores({
      where: { cnpj },
      select: {
        cnpj: true,
        name: true,
        cnd: {
          orderBy: { validade: "desc" },
          select: {
            tipo: true,
            validade: true,
            status: true,
            emissao: true,
            file_name: true,
          },
        },
      },
    });

    if (fornecedores.length === 0) {
      ApiResponseHandler.notFound(res, "Fornecedor");
      return;
    }

    const fornecedor = fornecedores[0] as any;

    if (limitPerTipo !== undefined && Array.isArray(fornecedor.cnd)) {
      const porTipo: Record<string, any[]> = {};
      for (const cnd of fornecedor.cnd) {
        if (!porTipo[cnd.tipo]) porTipo[cnd.tipo] = [];
        if (porTipo[cnd.tipo].length < limitPerTipo) porTipo[cnd.tipo].push(cnd);
      }
      fornecedor.cnd = Object.values(porTipo).flat();
    }

    ApiResponseHandler.success(res, fornecedor);
  } catch (error) {
    ApiResponseHandler.trycatchHandler(res, error as BaseError);
  }
});

export default fornecedorRoute;
