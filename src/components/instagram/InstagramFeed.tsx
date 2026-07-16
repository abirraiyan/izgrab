import React, { useEffect, useState } from "react";
import { InstagramPost } from "./Types";
import { InstagramService } from "./InstagramService";
import { InstagramCard } from "./InstagramCard";
import { getCloudinaryUrl } from "@/lib/cloudinary";

const izCroissant = '{"public_id":"iz-grab/products/gupfdi5jqjnh3mfmmicq","secure_url":"https://res.cloudinary.com/djnv9soqm/image/upload/v1782983353/iz-grab/products/gupfdi5jqjnh3mfmmicq.jpg","resource_type":"image","width":1024,"height":1024,"format":"jpg"}';
const izCremeBrulee = '{"public_id":"iz-grab/products/wvdzrvlxuarvt2xe5y9v","secure_url":"https://res.cloudinary.com/djnv9soqm/image/upload/v1782983354/iz-grab/products/wvdzrvlxuarvt2xe5y9v.jpg","resource_type":"image","width":1024,"height":1024,"format":"jpg"}';
const izPecanTart = '{"public_id":"iz-grab/products/tposaf26ixv0rzbyf6ix","secure_url":"https://res.cloudinary.com/djnv9soqm/image/upload/v1782983354/iz-grab/products/tposaf26ixv0rzbyf6ix.jpg","resource_type":"image","width":1024,"height":1024,"format":"jpg"}';
const izLatte = '{"public_id":"iz-grab/products/xdymybbgygjpnm1snt8b","secure_url":"https://res.cloudinary.com/djnv9soqm/image/upload/v1782983352/iz-grab/products/xdymybbgygjpnm1snt8b.jpg","resource_type":"image","width":1024,"height":1024,"format":"jpg"}';
const defaultFallbacks = [izCroissant, izCremeBrulee, izPecanTart, izLatte];

interface InstagramFeedProps {
  instagramUrl: string;
}

export const InstagramFeed: React.FC<InstagramFeedProps> = ({ instagramUrl }) => {
  const [posts, setPosts] = useState<InstagramPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    InstagramService.fetchLatestPosts()
      .then((data) => {
        if (active) {
          setPosts(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (active) {
          console.warn("Instagram dynamic feed loading failed. Utilizing fallback gallery:", err);
          setError(err.message || "Failed to load posts");
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="aspect-square rounded-2xl bg-muted animate-pulse border border-border/20"
          />
        ))}
      </div>
    );
  }

  // Gracefully fallback to static display on API failure or empty results
  if (error || posts.length === 0) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        {defaultFallbacks.map((img, i) => (
          <a
            key={i}
            href={instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="relative aspect-square rounded-2xl overflow-hidden group bg-muted shadow-soft hover:shadow-md transition-all duration-500 hover:scale-[1.02]"
          >
            <img
              src={getCloudinaryUrl(img, { width: 300, height: 300 })}
              alt="IZ Patisserie Instagram"
              loading="lazy"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-cocoa/0 group-hover:bg-cocoa/40 transition flex items-center justify-center">
              <span className="text-cream text-xs font-medium opacity-0 group-hover:opacity-100 transition tracking-wide">
                View on Instagram
              </span>
            </div>
          </a>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
      {posts.map((post) => (
        <InstagramCard key={post.id} post={post} />
      ))}
    </div>
  );
};
