// Copyright (c) 2026 Karthik Raj. All rights reserved. https://beautiful-alpaca-6b1495.netlify.app/
import { useEffect } from "react";

let counter = 0;

export default function JsonLd({ data }) {
  useEffect(() => {
    if (!data) return undefined;
    const id = `jsonld-${counter++}`;
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.id = id;
    script.text = JSON.stringify(data);
    document.head.appendChild(script);
    return () => {
      document.getElementById(id)?.remove();
    };
  }, [data]);

  return null;
}
