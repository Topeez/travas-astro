"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "../components/ui/form";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Button } from "../components/ui/button";
import { toast } from "sonner";
import { Check, X, ArrowRight, Loader2 } from "lucide-react";
import { useState } from "react";

const formSchema = z.object({
    fullname: z.string().min(2, {
        message: "Jméno musí mít alespoň 2 znaky.",
    }),
    email: z.string().email({
        message: "Zadejte platnou emailovou adresu.",
    }),
    phone: z
        .string()
        .min(10, { message: "Telefonní číslo musí mít alespoň 10 znaků" })
        .max(16, { message: "Telefonní číslo je příliš dlouhé" }),
    message: z.string().optional(),
});

function notify(type: "success" | "error", message: string) {
    if (type === "success") {
        toast.success(message, {
            description: "Vaše zpráva byla úspěšně odeslána.",
            duration: 6000,
            icon: <Check className="size-4 text-foreground" />,
            style: { borderLeft: "4px solid var(--foreground)" },
            classNames: { description: "text-foreground" },
        });
    } else {
        toast.error(message, {
            description: "Nastala chyba při odesílání.",
            duration: 6000,
            icon: <X className="size-4 text-destructive" />,
            style: { borderLeft: "4px solid var(--destructive)" },
            classNames: { description: "text-destructive" },
        });
    }
}

export function ContactForm() {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        mode: "onSubmit",
        reValidateMode: "onSubmit",
        defaultValues: { fullname: "", email: "", message: "", phone: "" },
    });

    async function onSubmit(data: z.infer<typeof formSchema>) {
        setIsSubmitting(true);
        try {
            const response = await fetch("/api/contact", {
                method: "POST",
                headers: { "Content-Type": "application/json", Accept: "application/json" },
                body: JSON.stringify(data),
            });

            const result = await response.json();

            if (!response.ok || !result.success) {
                console.error("Chyba: ", result.errors || result.error);
                notify("error", result.error || "Odeslání se nezdařilo.");
                return;
            }

            notify("success", "Vyčkejte na odpověď ve Vaší emailové schránce.");
            form.reset();
        } catch (error) {
            console.error("Chyba při odesílání: ", error);
            notify("error", "Odeslání se nezdařilo. Zkontrolujte připojení k internetu.");
        } finally {
            setIsSubmitting(false);
        }
    }

    const inputClasses =
        "mt-1 px-4 py-3 border bg-background! border-gray-300 focus:!border-foreground rounded-lg focus:outline-none focus:!ring-0 w-full transition-colors duration-300 ease-in-out";

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="z-10 space-y-6 bg-background" aria-label="Contact form">
                <FormField control={form.control} name="fullname" render={({ field }) => (
                    <FormItem>
                        <FormLabel className="block font-medium text-gray-700">Jméno a příjmení</FormLabel>
                        <FormControl>
                            <Input placeholder="Zadejte celé jméno" className={inputClasses} aria-label="Full name" {...field} />
                        </FormControl>
                        <FormMessage className="text-destructive text-sm" />
                    </FormItem>
                )} />

                <div className="gap-6 grid grid-cols-1 md:grid-cols-2">
                    <FormField control={form.control} name="email" render={({ field }) => (
                        <FormItem>
                            <FormLabel className="block font-medium text-gray-700">Email</FormLabel>
                            <FormControl>
                                <Input placeholder="Zadejte email" className={inputClasses} aria-label="Email" {...field} />
                            </FormControl>
                            <FormMessage className="text-destructive text-sm" />
                        </FormItem>
                    )} />
                    <FormField control={form.control} name="phone" render={({ field }) => (
                        <FormItem>
                            <FormLabel className="block font-medium text-gray-700">Telefon</FormLabel>
                            <FormControl>
                                <Input placeholder="Zadejte telefon" className={inputClasses} aria-label="Phone" {...field} />
                            </FormControl>
                            <FormMessage className="text-destructive text-sm" />
                        </FormItem>
                    )} />
                </div>

                <FormField control={form.control} name="message" render={({ field }) => (
                    <FormItem>
                        <FormLabel className="block font-medium text-gray-700">Zpráva</FormLabel>
                        <FormControl>
                            <Textarea placeholder="Napište svou zprávu..." className={`${inputClasses} min-h-37.5`} aria-label="Message" {...field} />
                        </FormControl>
                        <FormMessage className="text-destructive text-sm" />
                    </FormItem>
                )} />

                <Button type="submit" disabled={isSubmitting} className="group flex justify-center items-center gap-2 bg-foreground hover:bg-background mt-4 px-6 md:px-8 py-3 border border-foreground rounded-lg w-full font-bold text-background hover:text-foreground text-lg md:text-xl transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed" aria-label="Submit message">
                    {isSubmitting ? (
                        <> <Loader2 className="mt-0.5 size-5 animate-spin" /> Odesílám... </>
                    ) : (
                        <> Chci bezplatnou konzultaci <ArrowRight className="mt-0.5 size-5 transition-transform group-hover:translate-x-1" /> </>
                    )}
                </Button>
                <p className="mt-3 text-muted-foreground text-sm text-center">Volná kapacita pro nové zakázky – odpovím do 24 h</p>
            </form>
        </Form>
    );
}