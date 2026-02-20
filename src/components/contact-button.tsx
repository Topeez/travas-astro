import { Button, type ButtonProps } from "./ui/button";
import { cn } from "../lib/utils";

interface ContactButtonProps extends ButtonProps {
    href?: string;
    linkPrefix?: string;
}

export function ContactButton({
    href,
    linkPrefix,
    className,
    children,
    ...props
}: ContactButtonProps) {
    const finalHref =
        (href ?? linkPrefix) ? `/${linkPrefix}/#kontakt` : "/#kontakt";

    return (
        <Button
            asChild
            className={cn(
                "bg-foreground hover:bg-background px-8 py-6 border border-foreground rounded-3xl font-bold text-background hover:text-foreground text-lg transition cursor-pointer",
                className,
            )}
            {...props}
        >
            <a href={finalHref}>{children}</a>
        </Button>
    );
}
