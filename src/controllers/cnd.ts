import { prisma } from "../lib/prisma.js";
import { type NewCnd, type QueryCnd } from "../schemas/cnd.js";
import { Cnd } from "@prisma/client";

class CndManager {
  static async newCnd(data: NewCnd): Promise<Cnd> {
    
    const createdCnd = await prisma.cnd.create({
      data: {
        fornecedorid: data.fornecedorid,
        file_name: data.file_name,
        validade: new Date(`${data.validade}T12:00:00`),
        emissao: data.emissao ? new Date(`${data.emissao}T12:00:00`) : undefined,
        status: data.status,
        tipo: data.tipo,
      },
    });

    console.log(
      `CND criada com sucesso | Fornecedor: ${data.fornecedorid} | Tipo: ${data.tipo} | Validade: ${createdCnd.validade}`,
    );

    return createdCnd;
  }

  static async getCnd(prop: QueryCnd): Promise<Cnd[]> {
    console.log(
      "[CndTypeManager.getCndTypes] Buscando tipos de CND com filtros:",
      prop,
    );

    const cnds = await prisma.cnd.findMany({
      ...(prop.where && { where: prop.where }),
      ...(prop.orderBy && { orderBy: prop.orderBy }),
      ...(prop.include && { include: prop.include }),
      ...(prop.limit && { take: prop.limit }),
      ...(prop.page && { skip: (prop.page - 1) * prop.limit! }),
      ...(prop.select && { select: prop.select }),
    });

    console.log("[CndManager.getCnd] Encontrados", cnds.length, "registros");
    return cnds;
  }
}

export default CndManager;
