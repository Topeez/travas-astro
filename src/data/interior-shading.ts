import { Blinds, PanelRight, Layers, FoldHorizontal, Moon, Columns4, type LucideIcon } from "lucide-react";
import imgZaluzie from "../assets/img/IMG_7601.jpeg";
import imgZaluzieStresni from "../assets/img/zaluzie_stresni.png";
import imgLatkoveRolety from "../assets/img/latkove-rolety.jpg";
import imgLatkoveStresni from "../assets/img/latkove_stresni.png";
import imgPlise from "../assets/img/IMG_7820.jpeg";
import imgPliseStresni from "../assets/img/plise_stresni.png";
import imgJaponskaStena from "../assets/img/japonska_stena.jpg";
import imgDenNoc from "../assets/img/textil_roleta_den_a_noc.jpg";
import imgVertikalni from "../assets/img/vertikalni_zaluzie.jpg";
import type { ImageMetadata } from "astro";

export interface InteriorShading {
    img: ImageMetadata;
    title: string;
    description: string;
    icon: LucideIcon;
}

export const interiorShadingOptions: InteriorShading[] = [
    {
        img: imgZaluzie,
        title: "Žaluzie",
        description:
            "Praktické a nadčasové řešení pro regulaci světla. Hodí se do bytů, kanceláří i domů.",
        icon: Blinds,
    },
    {
        img: imgZaluzieStresni,
        title: "Žaluzie - střešní",
        description:
            "Ideální pro střešní okna – snadno ovladatelné, efektivně stíní a ladí s interiérem.",
        icon: Blinds,
    },
    {
        img: imgLatkoveRolety,
        title: "Látkové rolety",
        description:
            "Elegantní stínění v různých barvách i průhlednosti. Vhodné do ložnice, obýváku i kuchyně.",
        icon: Layers,
    },
    {
        img: imgLatkoveStresni,
        title: "Látkové rolety - střešní",
        description:
            "Jednoduché řešení pro střešní okna – dobře drží, neplandají a skvěle vypadají.",
        icon: Layers,
    },
    {
        img: imgPlise,
        title: "Plisé",
        description:
            "Designové skládací žaluzie, které se přizpůsobí každému oknu i prostoru.",
        icon:FoldHorizontal,
    },
    {
        img: imgPliseStresni,
        title: "Plisé - střešní",
        description:
            "Praktické a stylové plisé pro střešní okna. Výborně stíní a dobře drží v rámu.",
        icon: FoldHorizontal,
    },
    {
        img: imgJaponskaStena,
        title: "Japonské stěny",
        description:
            "Ideální pro velké prosklené plochy i jako elegantní interiérový prvek. Designová variabilita.",
        icon: PanelRight,
    },
    {
        img: imgDenNoc,
        title: "Rolety den/noc",
        description:
            "Účinné řešení pro úplné zatemnění místnosti. Vhodné do ložnic, domácích kin či hotelů.",
        icon: Moon,
    },
    {
        img: imgVertikalni,
        title: "Vertikální žaluzie",
        description:
            "Klasické i moderní řešení pro regulaci světla. Vhodné do každé místnosti díky různým materiálům a barevným variantám.",
        icon: Columns4,
    },
];

export const interiorShadingPros = [
    "Chrání před sluncem a UV zářením",
    "Zvyšuje soukromí ve dne i v noci",
    "Výrazný designový prvek interiéru",
    "Široký výběr látek, barev a textur",
];
