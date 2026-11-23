const VIDEO_ID = "Oi-nrjNvBb4";
const VIDEO_URL = `https://www.youtube.com/watch?v=${VIDEO_ID}`;

export default function TikTokEmbed() {
    return (
        <div className="ratio ratio-16x9 w-100" style={{ maxWidth: 900 }}>
            <iframe
                title="Review del ASUS ROG Strix G16 disponible en GameHub Store"
                src={`https://www.youtube-nocookie.com/embed/${VIDEO_ID}`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                referrerPolicy="strict-origin-when-cross-origin"
            />
            <noscript>
                <a href={VIDEO_URL} target="_blank" rel="noopener noreferrer">Ver video del ASUS ROG Strix G16</a>
            </noscript>
        </div>
    );
}
