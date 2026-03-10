import * as z from "zod";

const whereCnd = z
  .object({
    id: z.string().optional(),
    fornecedorid: z.string().optional(),
    file_name: z.string().optional(),
    validade: z.date().optional(),
    status: z.string().optional(),
    tipo: z.string().optional(),
  })
  .strict();

const orderByCnd = z.object({
  validade: z.enum(["asc", "desc"]).optional(),
  emissao: z.enum(["asc", "desc"]).optional(),
  createdAt: z.enum(["asc", "desc"]).optional(),
});

const includeCnd = z.object({
  fornecedor: z.boolean().optional(),
});

const selectCndFields = {
  id: z.boolean().optional(),
  fornecedorid: z.boolean().optional(),
  file_name: z.boolean().optional(),
  validade: z.boolean().optional(),
  emissao: z.boolean().optional(),
  status: z.string().optional(),
  tipo: z.boolean().optional(),
  createdAt: z.boolean().optional(),
};

const selectCnd: z.ZodType<any> = z.object({
  ...selectCndFields,
  fornecedor: z.boolean().optional(),
});

const queryCnd = z
  .object({
    where: whereCnd.optional(),
    orderBy: orderByCnd.optional(),
    include: includeCnd.optional(),
    limit: z.number().positive().max(50).optional(),
    page: z.number().int().min(1).optional(),
    select: selectCnd.optional(),
  })
  .refine((data) => !(data.limit && !data.page), {
    message: "page is required when limit is provided",
    path: ["page"],
  });

const cndTipoEnum = z.enum(["federal", "estadual", "municipal", "trabalhista", "fgts"]);

const newCnd = z
  .object({
    fornecedorid: z.string(),
    file_name: z.string(),
    validade: z.string(),
    emissao: z.string().optional(),
    status: z.enum(["regular", "irregular", "indefinido"]),
    tipo: cndTipoEnum,
  })
  .strict();

const updateCnd = newCnd.partial();

export type NewCnd = z.infer<typeof newCnd>;
export type UpdateCnd = z.infer<typeof updateCnd>;

export {
  queryCnd,
  whereCnd,
  orderByCnd,
  newCnd,
  updateCnd,
  selectCnd,
  selectCndFields,
};
