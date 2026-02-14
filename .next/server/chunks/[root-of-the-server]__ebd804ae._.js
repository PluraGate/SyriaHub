module.exports=[918622,(e,t,r)=>{t.exports=e.x("next/dist/compiled/next-server/app-page-turbo.runtime.prod.js",()=>require("next/dist/compiled/next-server/app-page-turbo.runtime.prod.js"))},556704,(e,t,r)=>{t.exports=e.x("next/dist/server/app-render/work-async-storage.external.js",()=>require("next/dist/server/app-render/work-async-storage.external.js"))},832319,(e,t,r)=>{t.exports=e.x("next/dist/server/app-render/work-unit-async-storage.external.js",()=>require("next/dist/server/app-render/work-unit-async-storage.external.js"))},324725,(e,t,r)=>{t.exports=e.x("next/dist/server/app-render/after-task-async-storage.external.js",()=>require("next/dist/server/app-render/after-task-async-storage.external.js"))},270406,(e,t,r)=>{t.exports=e.x("next/dist/compiled/@opentelemetry/api",()=>require("next/dist/compiled/@opentelemetry/api"))},193695,(e,t,r)=>{t.exports=e.x("next/dist/shared/lib/no-fallback-error.external.js",()=>require("next/dist/shared/lib/no-fallback-error.external.js"))},325627,e=>{"use strict";var t=e.i(522346),r=e.i(346481),a=e.i(331284),n=e.i(684688),o=e.i(991300),i=e.i(892129),s=e.i(956097),l=e.i(544183),d=e.i(904375),p=e.i(616305),c=e.i(699239),u=e.i(50776),m=e.i(183693),g=e.i(774859),h=e.i(838547),f=e.i(263952),x=e.i(193695);e.i(195872);var v=e.i(820448),R=e.i(780971),y=e.i(187267);async function b(e){try{var t,r,a,n,o,i;let{searchParams:s}=new URL(e.url),l=s.get("id"),d=s.get("format")||"markdown";if(!l)return R.NextResponse.json({error:"Post ID is required"},{status:400});let p=await (0,y.createClient)(),{data:c,error:u}=await p.from("posts").select(`
        id,
        title,
        content,
        tags,
        created_at,
        updated_at,
        content_type,
        license,
        author:users!posts_author_id_fkey(name, email)
      `).eq("id",l).single();if(u||!c)return R.NextResponse.json({error:"Post not found"},{status:404});let m=c.author?.name||c.author?.email?.split("@")[0]||"Anonymous",g=new Date(c.created_at).toLocaleDateString("en-US",{year:"numeric",month:"long",day:"numeric"});if("markdown"===d){let e,n=(t=c,r=m,a=g,e=t.tags?.length?t.tags.map(e=>`#${e}`).join(" "):"",`---
title: "${t.title}"
author: "${r}"
date: "${a}"
type: "${t.content_type||"article"}"
license: "${t.license||"CC-BY-4.0"}"
tags: [${t.tags?.map(e=>`"${e}"`).join(", ")||""}]
---

# ${t.title}

**Author:** ${r}  
**Published:** ${a}  
${e?`**Tags:** ${e}`:""}

---

${t.content}

---

*Exported from [Syrealize](https://syrealize.com) on ${new Date().toLocaleDateString()}*
`);return new R.NextResponse(n,{status:200,headers:{"Content-Type":"text/markdown; charset=utf-8","Content-Disposition":`attachment; filename="${w(c.title)}.md"`}})}if("json"===d){let e={title:c.title,author:m,content:c.content,tags:c.tags||[],publishedAt:c.created_at,updatedAt:c.updated_at,contentType:c.content_type,license:c.license,exportedAt:new Date().toISOString()};return R.NextResponse.json(e,{headers:{"Content-Disposition":`attachment; filename="${w(c.title)}.json"`}})}if("html"===d){let e,t=(n=c,o=m,i=g,e=n.tags?.length?n.tags.map(e=>`<span class="tag">#${e}</span>`).join(" "):"",`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${n.title} - Syrealize</title>
  <style>
    :root {
      --primary: #6366f1;
      --text: #1a1a2e;
      --text-light: #64748b;
      --bg: #ffffff;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.7;
      color: var(--text);
      background: var(--bg);
      max-width: 800px;
      margin: 0 auto;
      padding: 2rem;
    }
    header {
      margin-bottom: 2rem;
      padding-bottom: 1.5rem;
      border-bottom: 1px solid #e2e8f0;
    }
    h1 {
      font-size: 2.25rem;
      font-weight: 700;
      margin-bottom: 1rem;
      line-height: 1.2;
    }
    .meta {
      color: var(--text-light);
      font-size: 0.875rem;
    }
    .meta span { margin-right: 1rem; }
    .tags { margin-top: 0.75rem; }
    .tag {
      display: inline-block;
      padding: 0.25rem 0.75rem;
      background: #f1f5f9;
      border-radius: 9999px;
      font-size: 0.75rem;
      color: var(--primary);
      margin-right: 0.5rem;
    }
    article {
      font-size: 1.125rem;
    }
    article h2 { margin-top: 2rem; margin-bottom: 1rem; }
    article p { margin-bottom: 1rem; }
    article ul, article ol { margin-bottom: 1rem; padding-left: 1.5rem; }
    article code {
      background: #f1f5f9;
      padding: 0.125rem 0.375rem;
      border-radius: 0.25rem;
      font-size: 0.875em;
    }
    article pre {
      background: #1a1a2e;
      color: #e2e8f0;
      padding: 1rem;
      border-radius: 0.5rem;
      overflow-x: auto;
      margin-bottom: 1rem;
    }
    article blockquote {
      border-left: 4px solid var(--primary);
      padding-left: 1rem;
      color: var(--text-light);
      font-style: italic;
      margin-bottom: 1rem;
    }
    footer {
      margin-top: 3rem;
      padding-top: 1.5rem;
      border-top: 1px solid #e2e8f0;
      color: var(--text-light);
      font-size: 0.875rem;
      text-align: center;
    }
    a { color: var(--primary); }
  </style>
</head>
<body>
  <header>
    <h1>${n.title}</h1>
    <div class="meta">
      <span><strong>Author:</strong> ${o}</span>
      <span><strong>Published:</strong> ${i}</span>
    </div>
    ${e?`<div class="tags">${e}</div>`:""}
  </header>
  <article>
    ${n.content.replace(/^### (.*$)/gm,"<h3>$1</h3>").replace(/^## (.*$)/gm,"<h2>$1</h2>").replace(/^# (.*$)/gm,"<h1>$1</h1>").replace(/\*\*\*(.*?)\*\*\*/g,"<strong><em>$1</em></strong>").replace(/\*\*(.*?)\*\*/g,"<strong>$1</strong>").replace(/\*(.*?)\*/g,"<em>$1</em>").replace(/```[\w]*\n([\s\S]*?)```/g,"<pre><code>$1</code></pre>").replace(/`([^`]+)`/g,"<code>$1</code>").replace(/^> (.*$)/gm,"<blockquote>$1</blockquote>").replace(/\[([^\]]+)\]\(([^)]+)\)/g,'<a href="$2">$1</a>').replace(/^\- (.*$)/gm,"<li>$1</li>").replace(/(<li>.*<\/li>\n?)+/g,"<ul>$&</ul>").replace(/\n\n/g,"</p><p>").replace(/^(.+)$/gm,e=>e.startsWith("<")?e:`<p>${e}</p>`).replace(/<p><\/p>/g,"").replace(/<p>(<h[1-6]>)/g,"$1").replace(/(<\/h[1-6]>)<\/p>/g,"$1")}
  </article>
  <footer>
    <p>Exported from <a href="https://syrealize.com">Syrealize</a> on ${new Date().toLocaleDateString()}</p>
    <p>License: ${n.license||"CC-BY-4.0"}</p>
  </footer>
</body>
</html>`);return new R.NextResponse(t,{status:200,headers:{"Content-Type":"text/html; charset=utf-8","Content-Disposition":`attachment; filename="${w(c.title)}.html"`}})}return R.NextResponse.json({error:"Invalid format. Use markdown, json, or html."},{status:400})}catch(e){return console.error("Export error:",e),R.NextResponse.json({error:"Failed to export post"},{status:500})}}function w(e){return e.toLowerCase().replace(/[^a-z0-9\s-]/g,"").replace(/\s+/g,"-").substring(0,50)}e.s(["GET",()=>b],959507);var $=e.i(959507);let C=new t.AppRouteRouteModule({definition:{kind:r.RouteKind.APP_ROUTE,page:"/api/export/route",pathname:"/api/export",filename:"route",bundlePath:""},distDir:".next",relativeProjectDir:"",resolvedPagePath:"[project]/RiderProjects/SyriaHub/app/api/export/route.ts",nextConfigOutput:"",userland:$}),{workAsyncStorage:E,workUnitAsyncStorage:k,serverHooks:A}=C;function S(){return(0,a.patchFetch)({workAsyncStorage:E,workUnitAsyncStorage:k})}async function T(e,t,a){C.isDev&&(0,n.addRequestMeta)(e,"devRequestTimingInternalsEnd",process.hrtime.bigint());let R="/api/export/route";R=R.replace(/\/index$/,"")||"/";let y=await C.prepare(e,t,{srcPage:R,multiZoneDraftMode:!1});if(!y)return t.statusCode=400,t.end("Bad Request"),null==a.waitUntil||a.waitUntil.call(a,Promise.resolve()),null;let{buildId:b,params:w,nextConfig:$,parsedUrl:E,isDraftMode:k,prerenderManifest:A,routerServerContext:S,isOnDemandRevalidate:T,revalidateOnlyGenerated:_,resolvedPathname:N,clientReferenceManifest:j,serverActionsManifest:P}=y,q=(0,l.normalizeAppPath)(R),D=!!(A.dynamicRoutes[q]||A.routes[N]),O=async()=>((null==S?void 0:S.render404)?await S.render404(e,t,E,!1):t.end("This page could not be found"),null);if(D&&!k){let e=!!A.routes[N],t=A.dynamicRoutes[q];if(t&&!1===t.fallback&&!e){if($.experimental.adapterPath)return await O();throw new x.NoFallbackError}}let U=null;!D||C.isDev||k||(U="/index"===(U=N)?"/":U);let I=!0===C.isDev||!D,H=D&&!I;P&&j&&(0,i.setReferenceManifestsSingleton)({page:R,clientReferenceManifest:j,serverActionsManifest:P,serverModuleMap:(0,s.createServerModuleMap)({serverActionsManifest:P})});let M=e.method||"GET",z=(0,o.getTracer)(),F=z.getActiveScopeSpan(),L={params:w,prerenderManifest:A,renderOpts:{experimental:{authInterrupts:!!$.experimental.authInterrupts},cacheComponents:!!$.cacheComponents,supportsDynamicResponse:I,incrementalCache:(0,n.getRequestMeta)(e,"incrementalCache"),cacheLifeProfiles:$.cacheLife,waitUntil:a.waitUntil,onClose:e=>{t.on("close",e)},onAfterTaskError:void 0,onInstrumentationRequestError:(t,r,a)=>C.onRequestError(e,t,a,S)},sharedContext:{buildId:b}},B=new d.NodeNextRequest(e),K=new d.NodeNextResponse(t),G=p.NextRequestAdapter.fromNodeNextRequest(B,(0,p.signalFromNodeResponse)(t));try{let i=async e=>C.handle(G,L).finally(()=>{if(!e)return;e.setAttributes({"http.status_code":t.statusCode,"next.rsc":!1});let r=z.getRootSpanAttributes();if(!r)return;if(r.get("next.span_type")!==c.BaseServerSpan.handleRequest)return void console.warn(`Unexpected root span type '${r.get("next.span_type")}'. Please report this Next.js issue https://github.com/vercel/next.js`);let a=r.get("next.route");if(a){let t=`${M} ${a}`;e.setAttributes({"next.route":a,"http.route":a,"next.span_name":t}),e.updateName(t)}else e.updateName(`${M} ${R}`)}),s=!!(0,n.getRequestMeta)(e,"minimalMode"),l=async n=>{var o,l;let d=async({previousCacheEntry:r})=>{try{if(!s&&T&&_&&!r)return t.statusCode=404,t.setHeader("x-nextjs-cache","REVALIDATED"),t.end("This page could not be found"),null;let o=await i(n);e.fetchMetrics=L.renderOpts.fetchMetrics;let l=L.renderOpts.pendingWaitUntil;l&&a.waitUntil&&(a.waitUntil(l),l=void 0);let d=L.renderOpts.collectedTags;if(!D)return await (0,m.sendResponse)(B,K,o,L.renderOpts.pendingWaitUntil),null;{let e=await o.blob(),t=(0,g.toNodeOutgoingHttpHeaders)(o.headers);d&&(t[f.NEXT_CACHE_TAGS_HEADER]=d),!t["content-type"]&&e.type&&(t["content-type"]=e.type);let r=void 0!==L.renderOpts.collectedRevalidate&&!(L.renderOpts.collectedRevalidate>=f.INFINITE_CACHE)&&L.renderOpts.collectedRevalidate,a=void 0===L.renderOpts.collectedExpire||L.renderOpts.collectedExpire>=f.INFINITE_CACHE?void 0:L.renderOpts.collectedExpire;return{value:{kind:v.CachedRouteKind.APP_ROUTE,status:o.status,body:Buffer.from(await e.arrayBuffer()),headers:t},cacheControl:{revalidate:r,expire:a}}}}catch(t){throw(null==r?void 0:r.isStale)&&await C.onRequestError(e,t,{routerKind:"App Router",routePath:R,routeType:"route",revalidateReason:(0,u.getRevalidateReason)({isStaticGeneration:H,isOnDemandRevalidate:T})},S),t}},p=await C.handleResponse({req:e,nextConfig:$,cacheKey:U,routeKind:r.RouteKind.APP_ROUTE,isFallback:!1,prerenderManifest:A,isRoutePPREnabled:!1,isOnDemandRevalidate:T,revalidateOnlyGenerated:_,responseGenerator:d,waitUntil:a.waitUntil,isMinimalMode:s});if(!D)return null;if((null==p||null==(o=p.value)?void 0:o.kind)!==v.CachedRouteKind.APP_ROUTE)throw Object.defineProperty(Error(`Invariant: app-route received invalid cache entry ${null==p||null==(l=p.value)?void 0:l.kind}`),"__NEXT_ERROR_CODE",{value:"E701",enumerable:!1,configurable:!0});s||t.setHeader("x-nextjs-cache",T?"REVALIDATED":p.isMiss?"MISS":p.isStale?"STALE":"HIT"),k&&t.setHeader("Cache-Control","private, no-cache, no-store, max-age=0, must-revalidate");let c=(0,g.fromNodeOutgoingHttpHeaders)(p.value.headers);return s&&D||c.delete(f.NEXT_CACHE_TAGS_HEADER),!p.cacheControl||t.getHeader("Cache-Control")||c.get("Cache-Control")||c.set("Cache-Control",(0,h.getCacheControlHeader)(p.cacheControl)),await (0,m.sendResponse)(B,K,new Response(p.value.body,{headers:c,status:p.value.status||200})),null};F?await l(F):await z.withPropagatedContext(e.headers,()=>z.trace(c.BaseServerSpan.handleRequest,{spanName:`${M} ${R}`,kind:o.SpanKind.SERVER,attributes:{"http.method":M,"http.target":e.url}},l))}catch(t){if(t instanceof x.NoFallbackError||await C.onRequestError(e,t,{routerKind:"App Router",routePath:q,routeType:"route",revalidateReason:(0,u.getRevalidateReason)({isStaticGeneration:H,isOnDemandRevalidate:T})}),D)throw t;return await (0,m.sendResponse)(B,K,new Response(null,{status:500})),null}}e.s(["handler",()=>T,"patchFetch",()=>S,"routeModule",()=>C,"serverHooks",()=>A,"workAsyncStorage",()=>E,"workUnitAsyncStorage",()=>k],325627)}];

//# sourceMappingURL=%5Broot-of-the-server%5D__ebd804ae._.js.map