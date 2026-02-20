import { z } from "zod";

export const contactFormSchema = z.object({
    fullname: z.string()
        .min(2, "Jméno musí mít alespoň 2 znaky")
        .max(50, "Jméno nesmí překročit 50 znaků")
        .trim(),
    email: z.string()
        .email("Neplatná emailová adresa")
        .max(100, "Email nesmí překročit 100 znaků")
        .toLowerCase()
        .trim(),
    phone: z.string()
        .min(10, "Telefonní číslo musí mít alespoň 10 znaků")
        .max(16, "Telefonní číslo je příliš dlouhé"),
    message: z.string()
        .min(10, "Zpráva musí mít alespoň 10 znaků")
        .max(1000, "Zpráva nesmí překročit 1000 znaků")
        .trim(),
    honeypot: z.string().optional(),
});
