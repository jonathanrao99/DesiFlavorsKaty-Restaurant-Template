'use client';
import Script from 'next/script';
import { usePathname } from 'next/navigation';

export default function Analytics() {
  return (
    <>
      {/* Google Analytics */}
      <Script
        src="https://www.googletagmanager.com/gtag/js?id=G-M8JXTJWBTH"
        strategy="afterInteractive"
      />
      <Script id="ga-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-M8JXTJWBTH');
        `}
      </Script>
      {/* Umami Analytics */}
      <Script
        src="https://cloud.umami.is/script.js"
        defer
        data-website-id="0ab19376-7ad8-48fc-8f59-c69951883021"
        strategy="afterInteractive"
      />
      {/* Scroll Depth Tracking */}
      <Script id="scroll-depth-tracking" strategy="afterInteractive">
        {`(function(){
          var thresholds=[25,50,75,100];
          var triggered={};
          function onScroll(){
            var scrollY=window.scrollY+window.innerHeight;
            var docHeight=document.documentElement.scrollHeight;
            var percent=Math.round((scrollY/docHeight)*100);
            thresholds.forEach(function(t){
              if(percent>=t && !triggered[t]){
                if (typeof window.gtag === 'function') window.gtag('event','scroll_depth',{event_category:'Scroll',event_label:t+'%',value:t});
                if (typeof window.umami === 'function') window.umami('scroll_depth',{event_category:'Scroll',event_label:t+'%',value:t});
                triggered[t]=true;
              }
            });
          }
          window.addEventListener('scroll',function(){requestAnimationFrame(onScroll);});
        })();`}
      </Script>
    </>
  );
} 