import type { WithContext, LocalBusiness } from "schema-dts";


const TELEFON = "+420 735 864 899";
const EMAIL = "info@travasstineni.cz";
const PSC = "691 10";


export const localBusinessSchema: WithContext<LocalBusiness> = {
    "@context": "https://schema.org",
    "@type": "HomeAndConstructionBusiness",
    "@id": "https://travasstineni.cz/#business",
    name: "Travas Stínění",
    url: "https://travasstineni.cz",
    telephone: TELEFON,
    email: EMAIL,
    description:
        "Profesionální montáž stínící techniky – kompletní řešení od prvotního zaměření přes odbornou instalaci až po spolehlivý servis. Více než 8 let zkušeností.",
    priceRange: "$$",
    address: {
        "@type": "PostalAddress",
        addressLocality: "Kobylí",
        addressRegion: "Jihomoravský kraj",
        streetAddress: "Kobylí 587",
        postalCode: PSC,
        addressCountry: "CZ",
    },
    geo: {
        "@type": "GeoCoordinates",
        latitude: 49.2238,
        longitude: 17.6636,
    },
    areaServed: {
        "@type": "GeoCircle",
        geoMidpoint: {
            "@type": "GeoCoordinates",
            latitude: 48.9328,
            longitude: 16.8916,
        },
        geoRadius: "50000",
    },
    openingHoursSpecification: [
        {
            "@type": "OpeningHoursSpecification",
            dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
            opens: "07:00",
            closes: "17:00",
        },
    ],
    hasOfferCatalog: {
        "@type": "OfferCatalog",
        name: "Služby stínící techniky",
        itemListElement: [
            {
                "@type": "Offer",
                itemOffered: {
                    "@type": "Service",
                    name: "Stínicí technika",
                    description:
                        "Interierové žaluzie, plisé rolety, látkové clony i předokenní systémy.",
                },
            },
            {
                "@type": "Offer",
                itemOffered: {
                    "@type": "Service",
                    name: "Pergoly a přístřešky",
                    description:
                        "Bioklimatické pergoly pro terasu a designové přístřešky pro ochranu vozu.",
                },
            },
            {
                "@type": "Offer",
                itemOffered: {
                    "@type": "Service",
                    name: "Garážová vrata",
                    description:
                        "Sekční, rolovací i dvoukřídlá vrata s moderním ovládáním.",
                },
            },
            {
                "@type": "Offer",
                itemOffered: {
                    "@type": "Service",
                    name: "Markýzy",
                    description:
                        "Kazetové markýzy pro ochranu terasy či balkonu před sluncem i deštěm.",
                },
            },
            {
                "@type": "Offer",
                itemOffered: {
                    "@type": "Service",
                    name: "Sítě proti hmyzu",
                    description:
                        "Pevné, rolovací a posuvné sítě pro okna i dveře.",
                },
            },
        ],
    },
    aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: "5",
        reviewCount: "12",
        bestRating: "5",
        worstRating: "1",
    },
    review: [
        {
            "@type": "Review",
            author: { "@type": "Person", name: "Petr Novák" },
            reviewRating: { "@type": "Rating", ratingValue: "5" },
            reviewBody:
                "Velmi profesionální přístup. Montáž rolet proběhla rychle a precizně. Vše funguje bez problémů. Rozhodně doporučuji!",
        },
        {
            "@type": "Review",
            author: { "@type": "Person", name: "Jana Kovářová" },
            reviewRating: { "@type": "Rating", ratingValue: "5" },
            reviewBody:
                "Objednala jsem si markýzu na terasu a jsem nadšená. Instalace byla rychlá, cena férová a markýza dokonale plní svůj účel. Skvělá práce!",
        },
        {
            "@type": "Review",
            author: { "@type": "Person", name: "Martin Svoboda" },
            reviewRating: { "@type": "Rating", ratingValue: "5" },
            reviewBody:
                "Montáž garážových vrat proběhla bez problémů. Ocenil jsem individuální přístup a odborné rady. Servis je také na výborné úrovni.",
        },
        {
            "@type": "Review",
            author: { "@type": "Person", name: "Anna Horáková" },
            reviewRating: { "@type": "Rating", ratingValue: "5" },
            reviewBody:
                "Perfektní servis od začátku do konce. Rychlá reakce na dotazy, kvalitní materiály a precizní montáž. Jsem velmi spokojená s výsledkem.",
        },
        {
            "@type": "Review",
            author: { "@type": "Person", name: "Tomáš Veselý" },
            reviewRating: { "@type": "Rating", ratingValue: "5" },
            reviewBody:
                "Excellentní práce! Montáž žaluzií proběhla bez problémů a výsledek předčil moje očekávání. Určitě budu doporučovat dál.",
        },
        {
            "@type": "Review",
            author: { "@type": "Person", name: "Eva Černá" },
            reviewRating: { "@type": "Rating", ratingValue: "5" },
            reviewBody:
                "Venkovní žaluzie nám výrazně zlepšily pohodu bydlení. Montáž byla profesionální a poradil nám i s výběrem správného typu. Výborná komunikace!",
        },
        {
            "@type": "Review",
            author: { "@type": "Person", name: "Josef Horák" },
            reviewRating: { "@type": "Rating", ratingValue: "5" },
            reviewBody:
                "Investice do markýzy se určitě vyplatila. Kvalitní materiál, precizní práce a dodržení termínu. Doporučuji všem!",
        },
        {
            "@type": "Review",
            author: { "@type": "Person", name: "Marie Nováková" },
            reviewRating: { "@type": "Rating", ratingValue: "5" },
            reviewBody:
                "Velmi jsem si cenila individuálního přístupu a trpělivosti při výběru rolet. Montáž proběhla čistě a rychle. Jsem maximálně spokojená.",
        },
        {
            "@type": "Review",
            author: { "@type": "Person", name: "David Svoboda" },
            reviewRating: { "@type": "Rating", ratingValue: "5" },
            reviewBody:
                "Sekční vrata fungují perfektně. Ocenil jsem hlavně poradenství při výběru a rychlost realizace. Profesionální služby na vysoké úrovni.",
        },
        {
            "@type": "Review",
            author: { "@type": "Person", name: "Klára Veselá" },
            reviewRating: { "@type": "Rating", ratingValue: "5" },
            reviewBody:
                "Montáž okenních sítí byla rychlá a bez nepořádku. Sítě perfektně sedí a plní svou funkci. Rozhodně se obrátím znovu při dalších potřebách.",
        },
        {
            "@type": "Review",
            author: { "@type": "Person", name: "Pavel Kratochvíl" },
            reviewRating: { "@type": "Rating", ratingValue: "5" },
            reviewBody:
                "Rychlá a efektivní oprava staré markýzy. Problém byl vyřešen promptně. Férová cena a spolehlivý servis. Velmi doporučuji!",
        },
        {
            "@type": "Review",
            author: { "@type": "Person", name: "Lucie Malá" },
            reviewRating: { "@type": "Rating", ratingValue: "5" },
            reviewBody:
                "Lamelové žaluzie do kanceláře splnily všechna očekávání. Výborná kvalita, přesná montáž a vstřícný přístup. Díky za profesionální práci!",
        },
    ],
};
