// src/data/contact.ts
import { Phone, Mail, MapPin, Clock } from "lucide-react"; // Použij React verzi (univerzálnější) nebo @lucide/astro

export const contactInfo = [
    {
        icon: Phone, // Předáváme referenci na komponentu
        title: "Telefon",
        text: "+420 735 864 899",
        href: "tel:+420735864899",
        target: "_self"
    },
    {
        icon: Mail,
        title: "Email",
        text: "info@travasstineni.cz",
        href: "mailto:info@travasstineni.cz",
        target: "_self"
    },
    {
        icon: MapPin,
        title: "Sídlo",
        text: "Kobylí 587, 691 10 Kobylí",
        href: "https://maps.app.goo.gl/CcH32FaUAWpXKBJXA",
        target: "_blank"
    },
    {
        icon: Clock,
        title: "Kdy mě zastihnete?",
        contentLines: [
            "Telefonicky Po - Pá:",
            "8:00 - 16:00"
        ],
        href: null
    },
];
