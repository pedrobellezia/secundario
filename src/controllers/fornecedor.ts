import { prisma } from "../lib/prisma.js";
import * as z from "zod";
import { queryFornecedor } from "../schemas/fornecedor.js";
import { Fornecedor } from "@prisma/client";
import { ConflictError } from "../lib/error.js";

class FornecedorManager {
  static async newFornecedor(
    cnpj: string,
    name: string,
  ): Promise<Fornecedor> {
    console.log("[FornecedorManager.newFornecedor] Criando novo fornecedor:", { cnpj, name });

    const exist = await prisma.fornecedor.findFirst({ where: { cnpj } });

    if (exist) {
      throw new ConflictError(`Fornecedor com CNPJ "${cnpj}" já existe.`);
    }

    const fornecedor = await prisma.fornecedor.create({ data: { cnpj, name } });

    console.log("[FornecedorManager.newFornecedor] Fornecedor criado com sucesso:", fornecedor);
    return fornecedor;
  }

  static async findOrCreate(cnpj: string, nome: string): Promise<Fornecedor> {
    const existing = await prisma.fornecedor.findFirst({ where: { cnpj } });
    if (existing) return existing;

    const fornecedor = await prisma.fornecedor.create({
      data: { cnpj, name: nome },
    });
    console.log(`[FornecedorManager.findOrCreate] Fornecedor criado: ${cnpj} - ${nome}`);
    return fornecedor;
  }

  static async getFornecedores(
    prop: z.infer<typeof queryFornecedor>,
  ): Promise<Fornecedor[]> {
    console.log(
      "[FornecedorManager.getFornecedores] Buscando fornecedores com filtros:",
      prop,
    );

    const fornecedores = await prisma.fornecedor.findMany({
      ...(prop.where && { where: prop.where }),
      ...(prop.orderBy && { orderBy: prop.orderBy }),
      ...(prop.include && { include: prop.include }),
      ...(prop.limit && { take: prop.limit }),
      ...(prop.page && { skip: (prop.page - 1) * prop.limit! }),
      ...(prop.select && { select: prop.select }),
    });

    console.log(
      "[FornecedorManager.getFornecedores] Encontrados",
      fornecedores.length,
      "registros",
    );
    return fornecedores;
  }
}

export default FornecedorManager;
