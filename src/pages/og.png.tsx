import { ImageResponse } from "@vercel/og";

export const GET = async ({ request }: { request: Request }) => {
    const url = new URL(request.url);
    // Získáme titulek z URL, pokud není, dáme default
    const title = url.searchParams.get("title") || "Travas Stínění";

    return new ImageResponse(
        <div
            style={{
                display: "flex",
                height: "100%",
                width: "100%",
                alignItems: "center",
                justifyContent: "center",
                flexDirection: "column",
                backgroundColor: "#5ca437",
                color: "white",
                letterSpacing: "-.02em",
                fontWeight: 700,
            }}
        >
            <div style={{ fontSize: 80, marginBottom: 20 }}>{title}</div>
            <div style={{ fontSize: 40, opacity: 0.8 }}>
                Profesionální montáž stínící techniky
            </div>
        </div>,
        {
            width: 1200,
            height: 630,
        },
    );
};
