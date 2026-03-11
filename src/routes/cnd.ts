import { Router } from "express";
import multer from "multer";
import processBuffer, { savePdf } from "../lib/utils.js";
import CndManager from "../controllers/cnd.js";
import FornecedorManager from "../controllers/fornecedor.js";
import { newCnd, queryCnd } from "../schemas/cnd.js";
import ApiResponseHandler from "../lib/response.js";
import { BaseError } from "../lib/error.js";

const cndRoute = Router();

const upload = multer({
  storage: multer.memoryStorage(),
});

// POST / - Emitir nova CND
cndRoute.post("/", upload.array("file"), async (req, res) => {
  try {
    if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
      ApiResponseHandler.error(res, "Arquivo PDF é obrigatório", null, 400);
      return;
    }

    const results: {
      file: string;
      success: boolean;
      data?: any;
      error?: any;
    }[] = [];

    for (const file of req.files) {
      try {
        const pdfBuffer = file.buffer;
        const extracted = await processBuffer(pdfBuffer);

        if (!extracted.cnpj) {
          const reason = "CNPJ não encontrado no PDF";
          console.error(`[CND] Falha em "${file.originalname}": ${reason}`);
          results.push({
            file: file.originalname,
            success: false,
            error: reason,
          });
          continue;
        }

        const fornecedor = await FornecedorManager.findOrCreate(
          extracted.cnpj,
          extracted.nome ?? extracted.cnpj,
        );

        const fileName = await savePdf(pdfBuffer);

        const cndData = await newCnd.safeParseAsync({
          fornecedorid: fornecedor.id,
          file_name: fileName,
          validade: extracted.validade,
          emissao: extracted.emissao,
          status: extracted.status,
          tipo: extracted.tipo,
        });

        if (!cndData.success) {
          console.error(`[CND] Falha de validação em "${file.originalname}":`, cndData.error.issues);
          results.push({
            file: file.originalname,
            success: false,
            error: cndData.error.issues,
          });
          continue;
        }

        const cnd = await CndManager.newCnd(cndData.data);
        results.push({ file: file.originalname, success: true, data: cnd });
      } catch (err: any) {
        console.error(`[CND] Erro inesperado em "${file.originalname}":`, err);
        results.push({
          file: file.originalname,
          success: false,
          error: err.message,
        });
      }
    }

    const allFailed = results.every((r) => !r.success);
    const someFailed = results.some((r) => !r.success);
    const failed = results.filter((r) => !r.success);

    if (allFailed) {
      ApiResponseHandler.error(res, "Nenhum arquivo foi processado com sucesso", results, 422);
      return;
    }

    if (someFailed) {
      console.warn(`[CND] ${failed.length} arquivo(s) falharam:`, failed.map((r) => r.file));
    }

    ApiResponseHandler.success(res, { results, failed: someFailed ? failed : undefined }, someFailed ? 207 : 201);
  } catch (error) {
    ApiResponseHandler.trycatchHandler(res, error as BaseError);
  }
});

// POST /search - Busca avançada
cndRoute.post("/search", async (req, res) => {
  try {
    const data = await queryCnd.safeParseAsync(req.body);

    if (!data.success) {
      ApiResponseHandler.validationError(res, data.error);
      return;
    }

    const cnds = await CndManager.getCnd(data.data);

    ApiResponseHandler.success(res, cnds);
  } catch (error) {
    ApiResponseHandler.trycatchHandler(res, error as BaseError);
  }
});

export default cndRoute;
