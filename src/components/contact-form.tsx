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
    fullname: z
        .string()
        .trim()
        .min(2, { message: "Jméno musí mít alespoň 2 znaky." })
        .max(100, { message: "Jméno je příliš dlouhé." }),
    email: z
        .string()
        .trim()
        .max(254, { message: "E-mail je příliš dlouhý." })
        .email({ message: "Zadejte platnou e-mailovou adresu." }),
    phone: z
        .string()
        .trim()
        .min(9, { message: "Telefonní číslo musí mít alespoň 9 znaků." })
        .max(16, { message: "Telefonní číslo je příliš dlouhé." })
        .regex(/^\+?[0-9 ]+$/, {
            message: "Použijte jen číslice, mezery a případně + na začátku.",
        }),
    message: z
        .string()
        .max(5000, { message: "Zpráva je příliš dlouhá (max 5000 znaků)." })
        .optional(),
    website: z.string().optional(), // honeypot
});

type FormValues = z.infer<typeof formSchema>;

type ApiResponse = {
    success?: boolean;
    error?: string;
    errors?: Partial<Record<keyof FormValues, string>>;
};

function notify(type: "success" | "error", message: string) {
    if (type === "success") {
        toast.success("Zpráva byla odeslána", {
            description: message,
            duration: 6000,
            icon: <Check className="size-4 text-foreground" />,
            style: { borderLeft: "4px solid var(--foreground)" },
            classNames: { description: "text-foreground" },
        });
    } else {
        toast.error("Odeslání se nezdařilo", {
            description: message,
            duration: 6000,
            icon: <X className="size-4 text-destructive" />,
            style: { borderLeft: "4px solid var(--destructive)" },
            classNames: { description: "text-destructive" },
        });
    }
}

export function ContactForm() {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        mode: "onSubmit",
        reValidateMode: "onSubmit",
        defaultValues: {
            fullname: "",
            email: "",
            phone: "",
            message: "",
            website: "",
        },
    });

    async function onSubmit(values: FormValues) {
        setIsSubmitting(true);
        try {
            const response = await fetch("/api/contact", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },
                body: JSON.stringify(values),
            });

            let result: ApiResponse = {};
            try {
                result = await response.json();
            } catch {
                // odpověď není JSON (např. 404 nebo 500 z hostingu)
            }

            if (!response.ok || !result.success) {
                if (result.errors) {
                    for (const [field, message] of Object.entries(
                        result.errors,
                    )) {
                        if (message)
                            form.setError(field as keyof FormValues, {
                                message,
                            });
                    }
                }
                notify(
                    "error",
                    result.error ||
                        "Zkontrolujte údaje a zkuste to prosím znovu.",
                );
                return;
            }

            notify(
                "success",
                "Vyčkejte na odpověď ve Vaší e-mailové schránce.",
            );
            form.reset();
        } catch (error) {
            console.error("Chyba při odesílání:", error);
            notify(
                "error",
                "Zkontrolujte připojení k internetu a zkuste to znovu.",
            );
        } finally {
            setIsSubmitting(false);
        }
    }

    const inputClasses =
        "mt-1 px-4 py-3 border bg-background! border-gray-300 focus:border-foreground! rounded-lg focus:outline-none focus:ring-0! w-full transition-colors duration-300 ease-in-out";

    return (
        <Form {...form}>
            <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="z-10 space-y-6 bg-background"
                noValidate
            >
                <FormField
                    control={form.control}
                    name="fullname"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="block font-medium text-gray-700">
                                Jméno a příjmení
                            </FormLabel>
                            <FormControl>
                                <Input
                                    placeholder="Zadejte celé jméno"
                                    autoComplete="name"
                                    maxLength={100}
                                    className={inputClasses}
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage className="text-destructive text-sm" />
                        </FormItem>
                    )}
                />

                <div className="gap-6 grid grid-cols-1 md:grid-cols-2">
                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="block font-medium text-gray-700">
                                    E-mail
                                </FormLabel>
                                <FormControl>
                                    <Input
                                        type="email"
                                        inputMode="email"
                                        placeholder="Zadejte e-mail"
                                        autoComplete="email"
                                        maxLength={254}
                                        className={inputClasses}
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage className="text-destructive text-sm" />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="block font-medium text-gray-700">
                                    Telefon
                                </FormLabel>
                                <FormControl>
                                    <Input
                                        type="tel"
                                        inputMode="tel"
                                        placeholder="Zadejte telefon"
                                        autoComplete="tel"
                                        maxLength={16}
                                        className={inputClasses}
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage className="text-destructive text-sm" />
                            </FormItem>
                        )}
                    />
                </div>

                <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="block font-medium text-gray-700">
                                Zpráva
                            </FormLabel>
                            <FormControl>
                                <Textarea
                                    placeholder="Napište svou zprávu..."
                                    maxLength={5000}
                                    className={`${inputClasses} min-h-37.5`}
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage className="text-destructive text-sm" />
                        </FormItem>
                    )}
                />

                {/* Honeypot: skryté pole pro boty, uživatel ho nevidí ani nevyplní */}
                <div
                    aria-hidden="true"
                    className="-left-2499.75 absolute w-px h-px overflow-hidden"
                >
                    <label htmlFor="website">Web</label>
                    <input
                        id="website"
                        type="text"
                        tabIndex={-1}
                        autoComplete="off"
                        {...form.register("website")}
                    />
                </div>

                <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="group flex justify-center items-center gap-2 bg-foreground hover:bg-background disabled:opacity-50 mt-4 px-6 md:px-8 py-3 border border-foreground rounded-lg w-full font-bold text-background hover:text-foreground text-lg md:text-xl transition-colors cursor-pointer disabled:cursor-not-allowed"
                >
                    {isSubmitting ? (
                        <>
                            <Loader2 className="mt-0.5 size-5 animate-spin" />{" "}
                            Odesílám...
                        </>
                    ) : (
                        <>
                            Chci bezplatnou konzultaci
                            <ArrowRight className="mt-0.5 size-5 transition-transform group-hover:translate-x-1" />
                        </>
                    )}
                </Button>
                <p className="mt-3 text-muted-foreground text-sm text-center">
                    Volná kapacita pro nové zakázky – odpovím do 24 h
                </p>
            </form>
        </Form>
    );
}
