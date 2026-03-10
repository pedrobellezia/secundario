import * as z from "zod";
import { orderByCnd, whereCnd, selectCnd, selectCndFields } from "./cnd.js";
import { cnpj } from "cpf-cnpj-validator";

const whereFornecedor = z
  .object({
    cnpj: z
      .string()
      .refine((cnpjT) => cnpj.isValid(cnpjT), {
        message: "CNPJ inválido",
      })
      .optional(),
    name: z.string().optional(),
    id: z.string().optional(),
  })
  .strict();

const orderByFornecedor = z.object({
  cnpj: z.enum(["asc", "desc"]).optional(),
  name: z.enum(["asc", "desc"]).optional(),
  id: z.enum(["asc", "desc"]).optional(),
  createdAt: z.enum(["asc", "desc"]).optional(),
});

const includeFornecedor = z.object({
  cnd: z
    .union([
      z.boolean(),
      z.object({
        where: whereCnd.optional(),
        orderBy: orderByCnd.optional(),
      }),
    ])
    .optional(),
});

const selectFornecedorFields = {
  id: z.boolean().optional(),
  cnpj: z.boolean().optional(),
  name: z.boolean().optional(),
  createdAt: z.boolean().optional(),
};

const selectFornecedor: z.ZodType<any> = z.object({
  ...selectFornecedorFields,
  cnd: z
    .boolean()
    .or(
      z.lazy(() =>
        z.object({
          select: z.object({
            ...selectCndFields,
            fornecedor: z.boolean().optional(),
          }),
        }),
      ),
    )
    .optional(),
});

const queryFornecedor = z
  .object({
    where: whereFornecedor.optional(),
    orderBy: orderByFornecedor.optional(),
    include: includeFornecedor.optional(),
    limit: z.number().positive().max(50).optional(),
    page: z.number().int().min(1).optional(),
    select: selectFornecedor.optional(),
  })
  .refine((data) => !(data.limit && !data.page), {
    message: "page is required when limit is provided",
    path: ["page"],
  });

const newFornecedor = z
  .object({
    cnpj: z.string().refine((cnpjT) => cnpj.isValid(cnpjT), {
      message: "CNPJ inválido",
    }),
    name: z.string(),
  })
  .strict();

const updateFornecedor = newFornecedor.partial();

export {
  queryFornecedor,
  whereFornecedor,
  orderByFornecedor,
  newFornecedor,
  updateFornecedor,
  selectFornecedor,
  selectFornecedorFields,
};
