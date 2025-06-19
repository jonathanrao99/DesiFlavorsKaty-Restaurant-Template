export default function Head() {
  return (
    <>
      {/* Google tag (gtag.js) */}
      <script async src="https://www.googletagmanager.com/gtag/js?id=G-M8JXTJWBTH"></script>
      <script dangerouslySetInnerHTML={{
        __html: `
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}  
          gtag('js', new Date());

          gtag('config', 'G-M8JXTJWBTH');
        `
      }} />
      <script async defer src={process.env.NEXT_PUBLIC_UMAMI_SCRIPT_URL} data-website-id={process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID}></script>
      {/* PWA manifest for Google Pay requirements */}
      <link rel="manifest" href="/manifest.json" />
    </>
  );
} 
