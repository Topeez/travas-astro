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
import { Check, X } from "lucide-react";

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
    message: z.string().min(10, {
        message: "Zpráva musí mít alespoň 10 znaků.",
    }),
});

function notify(type: "success" | "error", message: string) {
    if (type === "success") {
        toast.success(message, {
            description: "Vaše zpráva byla úspěšně odeslána.",
            duration: 6000,
            icon: <Check className="size-4 text-foreground" />,
            style: { borderLeft: "4px solid var(--foreground)" },
            classNames: {
                description: "text-foreground",
            },
        });
    } else {
        toast.error(message, {
            description: "Nastala chyba při odesílání.",
            duration: 6000,
            icon: <X className="size-4 text-destructive" />,
            style: { borderLeft: "4px solid var(--destructive)" }, // Červená (případně "var(--destructive)")
            classNames: {
                description: "text-destructive",
            },
        });
    }
}

export function ContactForm() {
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        mode: "onSubmit",
        reValidateMode: "onSubmit",
        defaultValues: {
            fullname: "",
            email: "",
            message: "",
            phone: "",
        },
    });

    async function onSubmit(values: z.infer<typeof formSchema>) {
        try {
            const response = await fetch("/api/contact", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(values),
            });

            if (!response.ok) {
                const { error } = await response.json();
                console.error("Chyba: ", error);
                notify("error", "Odeslání se nezdařilo.");
                return;
            }

            notify("success", "Vyčkejte na odpověď ve Vaší emailové schránce.");
            form.reset();
        } catch (error) {
            console.error("Chyba při odesílání: ", error);
            notify("error", "Odeslání se nezdařilo.");
        }
    }

    const inputClasses =
        "mt-1 px-4 py-3 border border-gray-300 focus:!border-foreground rounded-lg focus:outline-none focus:!ring-0 w-full transition-colors duration-300 ease-in-out";

    return (
        <Form {...form}>
            <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="z-10 space-y-6 bg-background"
                aria-label="Contact form"
            >
                {/* Full Name Field */}
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
                                    className={`${inputClasses}`}
                                    aria-label="Full name"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage className="text-destructive text-sm" />
                        </FormItem>
                    )}
                />

                {/* Email and Phone Grid */}
                <div className="gap-6 grid grid-cols-1 md:grid-cols-2">
                    {/* Email Field */}
                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="block font-medium text-gray-700">
                                    Email
                                </FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="Zadejte email"
                                        className={`${inputClasses}`}
                                        aria-label="Email"
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage className="text-destructive text-sm" />
                            </FormItem>
                        )}
                    />

                    {/* Phone Field */}
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
                                        placeholder="Zadejte telefon"
                                        className={`${inputClasses}`}
                                        aria-label="Phone"
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage className="text-destructive text-sm" />
                            </FormItem>
                        )}
                    />
                </div>

                {/* Message Field */}
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
                                    className={`${inputClasses} min-h-37.5`}
                                    aria-label="Message"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage className="text-destructive text-sm" />
                        </FormItem>
                    )}
                />

                <Button
                    type="submit"
                    className="bg-foreground hover:bg-background mt-4 py-3 border border-foreground rounded-lg w-full font-bold text-background hover:text-foreground text-lg transition cursor-pointer"
                    aria-label="Submit message"
                >
                    Odeslat zprávu
                </Button>
            </form>
        </Form>
    );
}
