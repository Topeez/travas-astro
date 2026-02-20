import type { ImageMetadata } from 'astro';

import imgStineni from '../assets/img/d1ZQOl7-.jpg';
import imgPergola from '../assets/img/bio-pergola.jpg';
import imgGaraz from '../assets/img/garaz.jpeg';
import imgMarkyza from '../assets/img/markyza3.jpg';
import imgSite from '../assets/img/IMG_7628.jpeg';

export interface Service {
    title: string;
    description: string;
    image: ImageMetadata;
    link: string;
}

export const services: Service[] = [
    {
        title: "Stínicí technika",
        description: "Interierové žaluzie, plisé rolety, látkové clony i předokenní systémy.",
        image: imgStineni,
        link: "/stinici-technika"
    },
    {
        title: "Pergoly a přístřešky",
        description: "Bioklimatické pergoly pro vaši terasu...",
        image: imgPergola,
        link: "/pergoly-a-pristresky"
    },
    {
        title: "Garážová vrata",
        description: "Sekční, rolovací i dvoukřídlá vrata...",
        image: imgGaraz,
        link: "/garazova-vrata"
    },
    {
        title: "Markýzy",
        description: "Kazetové markýzy...",
        image: imgMarkyza,
        link: "/stinici-technika/markyzy"
    },
    {
        title: "Sítě proti hmyzu",
        description: "Pevné, rolovací a posuvné sítě...",
        image: imgSite,
        link: "/site-proti-hmyzu"
    }
];
