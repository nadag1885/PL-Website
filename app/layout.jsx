import "./globals.css";
import { Poppins, Montserrat } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { GoogleAnalytics } from "@next/third-parties/google";
import StyledJsxRegistry from "./registry";
import ChunkReload from "@/components/ChunkReload";

// Self-hosted at build time by Next — no runtime external request, no @import,
// no manual <head>. Montserrat stands in for the proprietary Nexa headline face.
const poppins = Poppins({
  subsets: ["latin"],
  // Only the weights actually used in the UI (300 and 900 were unused).
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-poppins",
});
const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
  variable: "--font-montserrat",
});

export const metadata = {
  title: "Powerline — Built where it counts, partnered for the rest",
  description:
    "Powerline is a leading provider of low and medium voltage electrical panels serving industries and infrastructure projects across Egypt and the region since 2012.",
  metadataBase: new URL("https://www.askpowerline.com"),
  openGraph: {
    title: "Powerline — Built where it counts, partnered for the rest",
    description:
      "Low and medium voltage electrical solutions, designed and manufactured to international standards.",
    type: "website",
  },
  icons: {
    icon: "/favicon.webp",
    shortcut: "/favicon.webp",
    apple: "/favicon.webp",
  },
};

export const viewport = {
  themeColor: "#050506",
  // Declare the site as dark so browsers (esp. Chrome/Android "force dark
  // mode") don't auto-invert an already-dark theme and wash out light-grey
  // text — emits <meta name="color-scheme" content="dark">.
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
};

// Critical, first-paint CSS — inlined in the initial HTML so the page never
// flashes unstyled/white before the main stylesheet applies.
const CRITICAL_CSS = `
  html { background: #050506; color-scheme: dark; }
  body {
    margin: 0;
    background: #050506;
    color: #f4f4f5;
    font-family: var(--font-poppins), system-ui, -apple-system, sans-serif;
    overflow-x: hidden;
  }
`;

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${poppins.variable} ${montserrat.variable}`}>
      <head>
        <style dangerouslySetInnerHTML={{ __html: CRITICAL_CSS }} />
      </head>
      <body>
        <ChunkReload />
        <StyledJsxRegistry>{children}</StyledJsxRegistry>
        <Analytics />
        <GoogleAnalytics gaId="G-3MVW1FNPDC" />
        {/* Chatbase AI chat bubble — embed kept verbatim (the pasted script.domain
            arrived with a markdown-link artifact; corrected to "www.chatbase.co"). */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){if(!window.chatbase||window.chatbase("getState")!=="initialized"){window.chatbase=(...arguments)=>{if(!window.chatbase.q){window.chatbase.q=[]}window.chatbase.q.push(arguments)};window.chatbase=new Proxy(window.chatbase,{get(target,prop){if(prop==="q"){return target.q}return(...args)=>target(prop,...args)}})}const onLoad=function(){const script=document.createElement("script");script.src="https://www.chatbase.co/embed.min.js";script.id="GTXWwV81kOPxm9yQkgeul";script.domain="www.chatbase.co";document.body.appendChild(script)};if(document.readyState==="complete"){onLoad()}else{window.addEventListener("load",onLoad)}})();`,
          }}
        />
      </body>
    </html>
  );
}