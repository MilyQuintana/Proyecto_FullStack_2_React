import { useState } from "react";

const VIDEO_URL = "https://www.tiktok.com/@jccomputers/video/7679526164934806804";
const VIDEO_ID = "7679526164934806804";

export default function TikTokEmbed() {
    const [cargar, setCargar] = useState(false);

    return (
        <div className="tiktok-embed-contenedor">
            {cargar ? (
                <iframe
                    title="Video de TikTok de GameHub Store"
                    src={`https://www.tiktok.com/embed/v2/${VIDEO_ID}`}
                    width="325"
                    height="740"
                    allowFullScreen
                    allow="encrypted-media; fullscreen; picture-in-picture"
                    referrerPolicy="strict-origin-when-cross-origin"
                    style={{ border: 0, maxWidth: "100%" }}
                />
            ) : (
                <button type="button" className="btn btn-primary" onClick={() => setCargar(true)}>
                    ▶ Ver video
                </button>
            )}
            <p className="small mt-2 mb-0">
                ¿No carga el video? <a href={VIDEO_URL} target="_blank" rel="noopener noreferrer">Míralo en TikTok</a>
            </p>
        </div>
    );
}