import { useEffect } from "react";

const VIDEO_URL = "https://www.tiktok.com/@jccomputers/video/7679526164934806804";
const VIDEO_ID = "7679526164934806804";
const SCRIPT_SRC = "https://www.tiktok.com/embed.js";

export default function TikTokEmbed() {
    useEffect(() => {
        const script = document.createElement("script");
        script.src = SCRIPT_SRC;
        script.async = true;
        document.body.appendChild(script);
        return () => {
            document.body.removeChild(script);
        };
    }, []);

    return (
        <blockquote
            className="tiktok-embed"
            cite={VIDEO_URL}
            data-video-id={VIDEO_ID}
            style={{ maxWidth: 605, minWidth: 325 }}
        >
            <section />
        </blockquote>
    );
}
