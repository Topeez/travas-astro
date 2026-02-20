import { PencilRuler, Award, Wrench, Zap, type LucideIcon } from "lucide-react";

export interface BenefitItem {
    icon: LucideIcon;
    title: string;
    description: string;
}

export const benefits: BenefitItem[] = [
    {
            icon: PencilRuler,
            title: "Individuální přístup",
            description: "Každé řešení navrhuji na míru vašim potřebám a stylu. Spolu najdeme optimální řešení pro Váš domov."
        },
        {
            icon: Award,
            title: "Ověřená kvalita",
            description: "Pracuji výhradně s prověřenými značkami a komponenty, které zaručují životnost a spolehlivost."
        },
        {
            icon: Wrench,
            title: "Profesionální servis",
            description: "Profesionální montáž i následný servis – vše pro vaši maximální spokojenost a komfort."
        },
        {
            icon: Zap,
            title: "Rychlé termíny",
            description: "Reaguji pružně na nové zakázky i opravy. Jsem schopen zajistit montáž/servis do 4 týdnů od objednání."
        }
]