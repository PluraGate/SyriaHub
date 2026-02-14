module.exports = [
"[project]/RiderProjects/SyriaHub/i18n/request.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$server$2f$react$2d$server$2f$getRequestConfig$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__default__as__getRequestConfig$3e$__ = __turbopack_context__.i("[project]/RiderProjects/SyriaHub/node_modules/next-intl/dist/esm/development/server/react-server/getRequestConfig.js [app-rsc] (ecmascript) <export default as getRequestConfig>");
;
const __TURBOPACK__default__export__ = (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$server$2f$react$2d$server$2f$getRequestConfig$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__default__as__getRequestConfig$3e$__["getRequestConfig"])(async ({ requestLocale })=>{
    // This typically corresponds to the `[locale]` segment
    let locale = await requestLocale;
    // Ensure that a valid locale is used
    if (!locale || ![
        'en',
        'ar'
    ].includes(locale)) {
        locale = 'en';
    }
    return {
        locale,
        messages: (await __turbopack_context__.f({
            "../messages/ar.json": {
                id: ()=>"[project]/RiderProjects/SyriaHub/messages/ar.json (json, async loader)",
                module: ()=>__turbopack_context__.A("[project]/RiderProjects/SyriaHub/messages/ar.json (json, async loader)")
            },
            "../messages/en.json": {
                id: ()=>"[project]/RiderProjects/SyriaHub/messages/en.json (json, async loader)",
                module: ()=>__turbopack_context__.A("[project]/RiderProjects/SyriaHub/messages/en.json (json, async loader)")
            }
        }).import(`../messages/${locale}.json`)).default
    };
});
}),
"[next]/internal/font/google/inter_5901b7c6.module.css [app-rsc] (css module)", ((__turbopack_context__) => {

__turbopack_context__.v({
  "className": "inter_5901b7c6-module__ec5Qua__className",
  "variable": "inter_5901b7c6-module__ec5Qua__variable",
});
}),
"[next]/internal/font/google/inter_5901b7c6.js [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$next$5d2f$internal$2f$font$2f$google$2f$inter_5901b7c6$2e$module$2e$css__$5b$app$2d$rsc$5d$__$28$css__module$29$__ = __turbopack_context__.i("[next]/internal/font/google/inter_5901b7c6.module.css [app-rsc] (css module)");
;
const fontData = {
    className: __TURBOPACK__imported__module__$5b$next$5d2f$internal$2f$font$2f$google$2f$inter_5901b7c6$2e$module$2e$css__$5b$app$2d$rsc$5d$__$28$css__module$29$__["default"].className,
    style: {
        fontFamily: "'Inter', 'Inter Fallback'",
        fontStyle: "normal"
    }
};
if (__TURBOPACK__imported__module__$5b$next$5d2f$internal$2f$font$2f$google$2f$inter_5901b7c6$2e$module$2e$css__$5b$app$2d$rsc$5d$__$28$css__module$29$__["default"].variable != null) {
    fontData.variable = __TURBOPACK__imported__module__$5b$next$5d2f$internal$2f$font$2f$google$2f$inter_5901b7c6$2e$module$2e$css__$5b$app$2d$rsc$5d$__$28$css__module$29$__["default"].variable;
}
const __TURBOPACK__default__export__ = fontData;
}),
"[next]/internal/font/google/outfit_8778cd42.module.css [app-rsc] (css module)", ((__turbopack_context__) => {

__turbopack_context__.v({
  "className": "outfit_8778cd42-module__wRojWG__className",
  "variable": "outfit_8778cd42-module__wRojWG__variable",
});
}),
"[next]/internal/font/google/outfit_8778cd42.js [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$next$5d2f$internal$2f$font$2f$google$2f$outfit_8778cd42$2e$module$2e$css__$5b$app$2d$rsc$5d$__$28$css__module$29$__ = __turbopack_context__.i("[next]/internal/font/google/outfit_8778cd42.module.css [app-rsc] (css module)");
;
const fontData = {
    className: __TURBOPACK__imported__module__$5b$next$5d2f$internal$2f$font$2f$google$2f$outfit_8778cd42$2e$module$2e$css__$5b$app$2d$rsc$5d$__$28$css__module$29$__["default"].className,
    style: {
        fontFamily: "'Outfit', 'Outfit Fallback'",
        fontStyle: "normal"
    }
};
if (__TURBOPACK__imported__module__$5b$next$5d2f$internal$2f$font$2f$google$2f$outfit_8778cd42$2e$module$2e$css__$5b$app$2d$rsc$5d$__$28$css__module$29$__["default"].variable != null) {
    fontData.variable = __TURBOPACK__imported__module__$5b$next$5d2f$internal$2f$font$2f$google$2f$outfit_8778cd42$2e$module$2e$css__$5b$app$2d$rsc$5d$__$28$css__module$29$__["default"].variable;
}
const __TURBOPACK__default__export__ = fontData;
}),
"[next]/internal/font/google/cairo_bd314a76.module.css [app-rsc] (css module)", ((__turbopack_context__) => {

__turbopack_context__.v({
  "className": "cairo_bd314a76-module__Mtovbq__className",
  "variable": "cairo_bd314a76-module__Mtovbq__variable",
});
}),
"[next]/internal/font/google/cairo_bd314a76.js [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$next$5d2f$internal$2f$font$2f$google$2f$cairo_bd314a76$2e$module$2e$css__$5b$app$2d$rsc$5d$__$28$css__module$29$__ = __turbopack_context__.i("[next]/internal/font/google/cairo_bd314a76.module.css [app-rsc] (css module)");
;
const fontData = {
    className: __TURBOPACK__imported__module__$5b$next$5d2f$internal$2f$font$2f$google$2f$cairo_bd314a76$2e$module$2e$css__$5b$app$2d$rsc$5d$__$28$css__module$29$__["default"].className,
    style: {
        fontFamily: "'Cairo', 'Cairo Fallback'",
        fontStyle: "normal"
    }
};
if (__TURBOPACK__imported__module__$5b$next$5d2f$internal$2f$font$2f$google$2f$cairo_bd314a76$2e$module$2e$css__$5b$app$2d$rsc$5d$__$28$css__module$29$__["default"].variable != null) {
    fontData.variable = __TURBOPACK__imported__module__$5b$next$5d2f$internal$2f$font$2f$google$2f$cairo_bd314a76$2e$module$2e$css__$5b$app$2d$rsc$5d$__$28$css__module$29$__["default"].variable;
}
const __TURBOPACK__default__export__ = fontData;
}),
"[project]/RiderProjects/SyriaHub/components/ui/toast.tsx [app-rsc] (client reference proxy) <module evaluation>", ((__turbopack_context__) => {
"use strict";

// This file is generated by next-core EcmascriptClientReferenceModule.
__turbopack_context__.s([
    "ToastProvider",
    ()=>ToastProvider,
    "useToast",
    ()=>useToast
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/RiderProjects/SyriaHub/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-server-dom-turbopack-server.js [app-rsc] (ecmascript)");
;
const ToastProvider = (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerClientReference"])(function() {
    throw new Error("Attempted to call ToastProvider() from the server but ToastProvider is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.");
}, "[project]/RiderProjects/SyriaHub/components/ui/toast.tsx <module evaluation>", "ToastProvider");
const useToast = (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerClientReference"])(function() {
    throw new Error("Attempted to call useToast() from the server but useToast is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.");
}, "[project]/RiderProjects/SyriaHub/components/ui/toast.tsx <module evaluation>", "useToast");
}),
"[project]/RiderProjects/SyriaHub/components/ui/toast.tsx [app-rsc] (client reference proxy)", ((__turbopack_context__) => {
"use strict";

// This file is generated by next-core EcmascriptClientReferenceModule.
__turbopack_context__.s([
    "ToastProvider",
    ()=>ToastProvider,
    "useToast",
    ()=>useToast
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/RiderProjects/SyriaHub/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-server-dom-turbopack-server.js [app-rsc] (ecmascript)");
;
const ToastProvider = (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerClientReference"])(function() {
    throw new Error("Attempted to call ToastProvider() from the server but ToastProvider is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.");
}, "[project]/RiderProjects/SyriaHub/components/ui/toast.tsx", "ToastProvider");
const useToast = (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerClientReference"])(function() {
    throw new Error("Attempted to call useToast() from the server but useToast is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.");
}, "[project]/RiderProjects/SyriaHub/components/ui/toast.tsx", "useToast");
}),
"[project]/RiderProjects/SyriaHub/components/ui/toast.tsx [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

var __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$components$2f$ui$2f$toast$2e$tsx__$5b$app$2d$rsc$5d$__$28$client__reference__proxy$29$__$3c$module__evaluation$3e$__ = __turbopack_context__.i("[project]/RiderProjects/SyriaHub/components/ui/toast.tsx [app-rsc] (client reference proxy) <module evaluation>");
var __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$components$2f$ui$2f$toast$2e$tsx__$5b$app$2d$rsc$5d$__$28$client__reference__proxy$29$__ = __turbopack_context__.i("[project]/RiderProjects/SyriaHub/components/ui/toast.tsx [app-rsc] (client reference proxy)");
;
__turbopack_context__.n(__TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$components$2f$ui$2f$toast$2e$tsx__$5b$app$2d$rsc$5d$__$28$client__reference__proxy$29$__);
}),
"[project]/RiderProjects/SyriaHub/components/NotificationsProvider.tsx [app-rsc] (client reference proxy) <module evaluation>", ((__turbopack_context__) => {
"use strict";

// This file is generated by next-core EcmascriptClientReferenceModule.
__turbopack_context__.s([
    "NotificationsProvider",
    ()=>NotificationsProvider,
    "useNotifications",
    ()=>useNotifications
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/RiderProjects/SyriaHub/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-server-dom-turbopack-server.js [app-rsc] (ecmascript)");
;
const NotificationsProvider = (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerClientReference"])(function() {
    throw new Error("Attempted to call NotificationsProvider() from the server but NotificationsProvider is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.");
}, "[project]/RiderProjects/SyriaHub/components/NotificationsProvider.tsx <module evaluation>", "NotificationsProvider");
const useNotifications = (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerClientReference"])(function() {
    throw new Error("Attempted to call useNotifications() from the server but useNotifications is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.");
}, "[project]/RiderProjects/SyriaHub/components/NotificationsProvider.tsx <module evaluation>", "useNotifications");
}),
"[project]/RiderProjects/SyriaHub/components/NotificationsProvider.tsx [app-rsc] (client reference proxy)", ((__turbopack_context__) => {
"use strict";

// This file is generated by next-core EcmascriptClientReferenceModule.
__turbopack_context__.s([
    "NotificationsProvider",
    ()=>NotificationsProvider,
    "useNotifications",
    ()=>useNotifications
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/RiderProjects/SyriaHub/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-server-dom-turbopack-server.js [app-rsc] (ecmascript)");
;
const NotificationsProvider = (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerClientReference"])(function() {
    throw new Error("Attempted to call NotificationsProvider() from the server but NotificationsProvider is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.");
}, "[project]/RiderProjects/SyriaHub/components/NotificationsProvider.tsx", "NotificationsProvider");
const useNotifications = (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerClientReference"])(function() {
    throw new Error("Attempted to call useNotifications() from the server but useNotifications is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.");
}, "[project]/RiderProjects/SyriaHub/components/NotificationsProvider.tsx", "useNotifications");
}),
"[project]/RiderProjects/SyriaHub/components/NotificationsProvider.tsx [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

var __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$components$2f$NotificationsProvider$2e$tsx__$5b$app$2d$rsc$5d$__$28$client__reference__proxy$29$__$3c$module__evaluation$3e$__ = __turbopack_context__.i("[project]/RiderProjects/SyriaHub/components/NotificationsProvider.tsx [app-rsc] (client reference proxy) <module evaluation>");
var __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$components$2f$NotificationsProvider$2e$tsx__$5b$app$2d$rsc$5d$__$28$client__reference__proxy$29$__ = __turbopack_context__.i("[project]/RiderProjects/SyriaHub/components/NotificationsProvider.tsx [app-rsc] (client reference proxy)");
;
__turbopack_context__.n(__TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$components$2f$NotificationsProvider$2e$tsx__$5b$app$2d$rsc$5d$__$28$client__reference__proxy$29$__);
}),
"[project]/RiderProjects/SyriaHub/components/AppErrorBoundary.tsx [app-rsc] (client reference proxy) <module evaluation>", ((__turbopack_context__) => {
"use strict";

// This file is generated by next-core EcmascriptClientReferenceModule.
__turbopack_context__.s([
    "AppErrorBoundary",
    ()=>AppErrorBoundary
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/RiderProjects/SyriaHub/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-server-dom-turbopack-server.js [app-rsc] (ecmascript)");
;
const AppErrorBoundary = (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerClientReference"])(function() {
    throw new Error("Attempted to call AppErrorBoundary() from the server but AppErrorBoundary is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.");
}, "[project]/RiderProjects/SyriaHub/components/AppErrorBoundary.tsx <module evaluation>", "AppErrorBoundary");
}),
"[project]/RiderProjects/SyriaHub/components/AppErrorBoundary.tsx [app-rsc] (client reference proxy)", ((__turbopack_context__) => {
"use strict";

// This file is generated by next-core EcmascriptClientReferenceModule.
__turbopack_context__.s([
    "AppErrorBoundary",
    ()=>AppErrorBoundary
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/RiderProjects/SyriaHub/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-server-dom-turbopack-server.js [app-rsc] (ecmascript)");
;
const AppErrorBoundary = (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerClientReference"])(function() {
    throw new Error("Attempted to call AppErrorBoundary() from the server but AppErrorBoundary is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.");
}, "[project]/RiderProjects/SyriaHub/components/AppErrorBoundary.tsx", "AppErrorBoundary");
}),
"[project]/RiderProjects/SyriaHub/components/AppErrorBoundary.tsx [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

var __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$components$2f$AppErrorBoundary$2e$tsx__$5b$app$2d$rsc$5d$__$28$client__reference__proxy$29$__$3c$module__evaluation$3e$__ = __turbopack_context__.i("[project]/RiderProjects/SyriaHub/components/AppErrorBoundary.tsx [app-rsc] (client reference proxy) <module evaluation>");
var __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$components$2f$AppErrorBoundary$2e$tsx__$5b$app$2d$rsc$5d$__$28$client__reference__proxy$29$__ = __turbopack_context__.i("[project]/RiderProjects/SyriaHub/components/AppErrorBoundary.tsx [app-rsc] (client reference proxy)");
;
__turbopack_context__.n(__TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$components$2f$AppErrorBoundary$2e$tsx__$5b$app$2d$rsc$5d$__$28$client__reference__proxy$29$__);
}),
"[project]/RiderProjects/SyriaHub/contexts/PreferencesContext.tsx [app-rsc] (client reference proxy) <module evaluation>", ((__turbopack_context__) => {
"use strict";

// This file is generated by next-core EcmascriptClientReferenceModule.
__turbopack_context__.s([
    "PreferencesProvider",
    ()=>PreferencesProvider,
    "usePreferences",
    ()=>usePreferences,
    "useTheme",
    ()=>useTheme
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/RiderProjects/SyriaHub/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-server-dom-turbopack-server.js [app-rsc] (ecmascript)");
;
const PreferencesProvider = (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerClientReference"])(function() {
    throw new Error("Attempted to call PreferencesProvider() from the server but PreferencesProvider is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.");
}, "[project]/RiderProjects/SyriaHub/contexts/PreferencesContext.tsx <module evaluation>", "PreferencesProvider");
const usePreferences = (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerClientReference"])(function() {
    throw new Error("Attempted to call usePreferences() from the server but usePreferences is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.");
}, "[project]/RiderProjects/SyriaHub/contexts/PreferencesContext.tsx <module evaluation>", "usePreferences");
const useTheme = (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerClientReference"])(function() {
    throw new Error("Attempted to call useTheme() from the server but useTheme is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.");
}, "[project]/RiderProjects/SyriaHub/contexts/PreferencesContext.tsx <module evaluation>", "useTheme");
}),
"[project]/RiderProjects/SyriaHub/contexts/PreferencesContext.tsx [app-rsc] (client reference proxy)", ((__turbopack_context__) => {
"use strict";

// This file is generated by next-core EcmascriptClientReferenceModule.
__turbopack_context__.s([
    "PreferencesProvider",
    ()=>PreferencesProvider,
    "usePreferences",
    ()=>usePreferences,
    "useTheme",
    ()=>useTheme
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/RiderProjects/SyriaHub/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-server-dom-turbopack-server.js [app-rsc] (ecmascript)");
;
const PreferencesProvider = (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerClientReference"])(function() {
    throw new Error("Attempted to call PreferencesProvider() from the server but PreferencesProvider is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.");
}, "[project]/RiderProjects/SyriaHub/contexts/PreferencesContext.tsx", "PreferencesProvider");
const usePreferences = (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerClientReference"])(function() {
    throw new Error("Attempted to call usePreferences() from the server but usePreferences is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.");
}, "[project]/RiderProjects/SyriaHub/contexts/PreferencesContext.tsx", "usePreferences");
const useTheme = (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerClientReference"])(function() {
    throw new Error("Attempted to call useTheme() from the server but useTheme is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.");
}, "[project]/RiderProjects/SyriaHub/contexts/PreferencesContext.tsx", "useTheme");
}),
"[project]/RiderProjects/SyriaHub/contexts/PreferencesContext.tsx [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

var __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$contexts$2f$PreferencesContext$2e$tsx__$5b$app$2d$rsc$5d$__$28$client__reference__proxy$29$__$3c$module__evaluation$3e$__ = __turbopack_context__.i("[project]/RiderProjects/SyriaHub/contexts/PreferencesContext.tsx [app-rsc] (client reference proxy) <module evaluation>");
var __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$contexts$2f$PreferencesContext$2e$tsx__$5b$app$2d$rsc$5d$__$28$client__reference__proxy$29$__ = __turbopack_context__.i("[project]/RiderProjects/SyriaHub/contexts/PreferencesContext.tsx [app-rsc] (client reference proxy)");
;
__turbopack_context__.n(__TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$contexts$2f$PreferencesContext$2e$tsx__$5b$app$2d$rsc$5d$__$28$client__reference__proxy$29$__);
}),
"[project]/RiderProjects/SyriaHub/components/accessibility.tsx [app-rsc] (client reference proxy) <module evaluation>", ((__turbopack_context__) => {
"use strict";

// This file is generated by next-core EcmascriptClientReferenceModule.
__turbopack_context__.s([
    "FocusTrap",
    ()=>FocusTrap,
    "LiveRegion",
    ()=>LiveRegion,
    "SkipNavContent",
    ()=>SkipNavContent,
    "SkipNavLink",
    ()=>SkipNavLink,
    "VisuallyHidden",
    ()=>VisuallyHidden,
    "useAnnounce",
    ()=>useAnnounce,
    "useKeyboardNavigation",
    ()=>useKeyboardNavigation,
    "usePrefersReducedMotion",
    ()=>usePrefersReducedMotion
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/RiderProjects/SyriaHub/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-server-dom-turbopack-server.js [app-rsc] (ecmascript)");
;
const FocusTrap = (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerClientReference"])(function() {
    throw new Error("Attempted to call FocusTrap() from the server but FocusTrap is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.");
}, "[project]/RiderProjects/SyriaHub/components/accessibility.tsx <module evaluation>", "FocusTrap");
const LiveRegion = (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerClientReference"])(function() {
    throw new Error("Attempted to call LiveRegion() from the server but LiveRegion is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.");
}, "[project]/RiderProjects/SyriaHub/components/accessibility.tsx <module evaluation>", "LiveRegion");
const SkipNavContent = (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerClientReference"])(function() {
    throw new Error("Attempted to call SkipNavContent() from the server but SkipNavContent is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.");
}, "[project]/RiderProjects/SyriaHub/components/accessibility.tsx <module evaluation>", "SkipNavContent");
const SkipNavLink = (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerClientReference"])(function() {
    throw new Error("Attempted to call SkipNavLink() from the server but SkipNavLink is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.");
}, "[project]/RiderProjects/SyriaHub/components/accessibility.tsx <module evaluation>", "SkipNavLink");
const VisuallyHidden = (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerClientReference"])(function() {
    throw new Error("Attempted to call VisuallyHidden() from the server but VisuallyHidden is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.");
}, "[project]/RiderProjects/SyriaHub/components/accessibility.tsx <module evaluation>", "VisuallyHidden");
const useAnnounce = (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerClientReference"])(function() {
    throw new Error("Attempted to call useAnnounce() from the server but useAnnounce is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.");
}, "[project]/RiderProjects/SyriaHub/components/accessibility.tsx <module evaluation>", "useAnnounce");
const useKeyboardNavigation = (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerClientReference"])(function() {
    throw new Error("Attempted to call useKeyboardNavigation() from the server but useKeyboardNavigation is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.");
}, "[project]/RiderProjects/SyriaHub/components/accessibility.tsx <module evaluation>", "useKeyboardNavigation");
const usePrefersReducedMotion = (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerClientReference"])(function() {
    throw new Error("Attempted to call usePrefersReducedMotion() from the server but usePrefersReducedMotion is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.");
}, "[project]/RiderProjects/SyriaHub/components/accessibility.tsx <module evaluation>", "usePrefersReducedMotion");
}),
"[project]/RiderProjects/SyriaHub/components/accessibility.tsx [app-rsc] (client reference proxy)", ((__turbopack_context__) => {
"use strict";

// This file is generated by next-core EcmascriptClientReferenceModule.
__turbopack_context__.s([
    "FocusTrap",
    ()=>FocusTrap,
    "LiveRegion",
    ()=>LiveRegion,
    "SkipNavContent",
    ()=>SkipNavContent,
    "SkipNavLink",
    ()=>SkipNavLink,
    "VisuallyHidden",
    ()=>VisuallyHidden,
    "useAnnounce",
    ()=>useAnnounce,
    "useKeyboardNavigation",
    ()=>useKeyboardNavigation,
    "usePrefersReducedMotion",
    ()=>usePrefersReducedMotion
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/RiderProjects/SyriaHub/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-server-dom-turbopack-server.js [app-rsc] (ecmascript)");
;
const FocusTrap = (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerClientReference"])(function() {
    throw new Error("Attempted to call FocusTrap() from the server but FocusTrap is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.");
}, "[project]/RiderProjects/SyriaHub/components/accessibility.tsx", "FocusTrap");
const LiveRegion = (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerClientReference"])(function() {
    throw new Error("Attempted to call LiveRegion() from the server but LiveRegion is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.");
}, "[project]/RiderProjects/SyriaHub/components/accessibility.tsx", "LiveRegion");
const SkipNavContent = (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerClientReference"])(function() {
    throw new Error("Attempted to call SkipNavContent() from the server but SkipNavContent is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.");
}, "[project]/RiderProjects/SyriaHub/components/accessibility.tsx", "SkipNavContent");
const SkipNavLink = (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerClientReference"])(function() {
    throw new Error("Attempted to call SkipNavLink() from the server but SkipNavLink is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.");
}, "[project]/RiderProjects/SyriaHub/components/accessibility.tsx", "SkipNavLink");
const VisuallyHidden = (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerClientReference"])(function() {
    throw new Error("Attempted to call VisuallyHidden() from the server but VisuallyHidden is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.");
}, "[project]/RiderProjects/SyriaHub/components/accessibility.tsx", "VisuallyHidden");
const useAnnounce = (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerClientReference"])(function() {
    throw new Error("Attempted to call useAnnounce() from the server but useAnnounce is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.");
}, "[project]/RiderProjects/SyriaHub/components/accessibility.tsx", "useAnnounce");
const useKeyboardNavigation = (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerClientReference"])(function() {
    throw new Error("Attempted to call useKeyboardNavigation() from the server but useKeyboardNavigation is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.");
}, "[project]/RiderProjects/SyriaHub/components/accessibility.tsx", "useKeyboardNavigation");
const usePrefersReducedMotion = (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerClientReference"])(function() {
    throw new Error("Attempted to call usePrefersReducedMotion() from the server but usePrefersReducedMotion is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.");
}, "[project]/RiderProjects/SyriaHub/components/accessibility.tsx", "usePrefersReducedMotion");
}),
"[project]/RiderProjects/SyriaHub/components/accessibility.tsx [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

var __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$components$2f$accessibility$2e$tsx__$5b$app$2d$rsc$5d$__$28$client__reference__proxy$29$__$3c$module__evaluation$3e$__ = __turbopack_context__.i("[project]/RiderProjects/SyriaHub/components/accessibility.tsx [app-rsc] (client reference proxy) <module evaluation>");
var __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$components$2f$accessibility$2e$tsx__$5b$app$2d$rsc$5d$__$28$client__reference__proxy$29$__ = __turbopack_context__.i("[project]/RiderProjects/SyriaHub/components/accessibility.tsx [app-rsc] (client reference proxy)");
;
__turbopack_context__.n(__TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$components$2f$accessibility$2e$tsx__$5b$app$2d$rsc$5d$__$28$client__reference__proxy$29$__);
}),
"[project]/RiderProjects/SyriaHub/lib/supabase/server.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "createClient",
    ()=>createClient
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$supabase$2f$ssr$2f$dist$2f$module$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/RiderProjects/SyriaHub/node_modules/@supabase/ssr/dist/module/index.js [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$supabase$2f$ssr$2f$dist$2f$module$2f$createServerClient$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/RiderProjects/SyriaHub/node_modules/@supabase/ssr/dist/module/createServerClient.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$next$2f$headers$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/RiderProjects/SyriaHub/node_modules/next/headers.js [app-rsc] (ecmascript)");
;
;
async function createClient() {
    const cookieStore = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$next$2f$headers$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["cookies"])();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$supabase$2f$ssr$2f$dist$2f$module$2f$createServerClient$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["createServerClient"])(("TURBOPACK compile-time value", "https://bwrdwbmhxtrghyrrfofb.supabase.co"), ("TURBOPACK compile-time value", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ3cmR3Ym1oeHRyZ2h5cnJmb2ZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg5NzU1NzMsImV4cCI6MjA3NDU1MTU3M30.yf4aP7pq_QkhRx_4nacfCcZ6mSsPtE3LeHw442gyv9U"), {
        cookies: {
            get (name) {
                return cookieStore.get(name)?.value;
            },
            set (name, value, options) {
                try {
                    cookieStore.set({
                        name,
                        value,
                        ...options
                    });
                } catch (error) {
                // The `set` method was called from a Server Component.
                // This can be ignored if you have middleware refreshing
                // user sessions.
                }
            },
            remove (name, options) {
                try {
                    cookieStore.set({
                        name,
                        value: '',
                        ...options
                    });
                } catch (error) {
                // The `delete` method was called from a Server Component.
                // This can be ignored if you have middleware refreshing
                // user sessions.
                }
            }
        }
    });
}
}),
"[project]/RiderProjects/SyriaHub/app/[locale]/layout.tsx [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>RootLayout,
    "generateStaticParams",
    ()=>generateStaticParams,
    "metadata",
    ()=>metadata
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/RiderProjects/SyriaHub/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-jsx-dev-runtime.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$server$2f$NextIntlClientProviderServer$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__default__as__NextIntlClientProvider$3e$__ = __turbopack_context__.i("[project]/RiderProjects/SyriaHub/node_modules/next-intl/dist/esm/development/react-server/NextIntlClientProviderServer.js [app-rsc] (ecmascript) <export default as NextIntlClientProvider>");
var __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$server$2f$react$2d$server$2f$getMessages$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__default__as__getMessages$3e$__ = __turbopack_context__.i("[project]/RiderProjects/SyriaHub/node_modules/next-intl/dist/esm/development/server/react-server/getMessages.js [app-rsc] (ecmascript) <export default as getMessages>");
var __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$next$2f$dist$2f$api$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/RiderProjects/SyriaHub/node_modules/next/dist/api/navigation.react-server.js [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$next$2f$dist$2f$client$2f$components$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/RiderProjects/SyriaHub/node_modules/next/dist/client/components/navigation.react-server.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$next$5d2f$internal$2f$font$2f$google$2f$inter_5901b7c6$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[next]/internal/font/google/inter_5901b7c6.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$next$5d2f$internal$2f$font$2f$google$2f$outfit_8778cd42$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[next]/internal/font/google/outfit_8778cd42.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$next$5d2f$internal$2f$font$2f$google$2f$cairo_bd314a76$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[next]/internal/font/google/cairo_bd314a76.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$components$2f$ui$2f$toast$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/RiderProjects/SyriaHub/components/ui/toast.tsx [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$components$2f$NotificationsProvider$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/RiderProjects/SyriaHub/components/NotificationsProvider.tsx [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$components$2f$AppErrorBoundary$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/RiderProjects/SyriaHub/components/AppErrorBoundary.tsx [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$contexts$2f$PreferencesContext$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/RiderProjects/SyriaHub/contexts/PreferencesContext.tsx [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$components$2f$accessibility$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/RiderProjects/SyriaHub/components/accessibility.tsx [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$lib$2f$supabase$2f$server$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/RiderProjects/SyriaHub/lib/supabase/server.ts [app-rsc] (ecmascript)");
;
;
;
;
;
;
;
;
;
;
;
;
;
;
const metadata = {
    title: 'Syrealize',
    description: 'A minimalist research platform for collaborative knowledge sharing'
};
async function RootLayout({ children, params }) {
    const { locale } = await params;
    // Ensure that the incoming `locale` is valid
    if (![
        'en',
        'ar'
    ].includes(locale)) {
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$next$2f$dist$2f$client$2f$components$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["notFound"])();
    }
    // Get user for preferences
    const supabase = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$lib$2f$supabase$2f$server$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["createClient"])();
    const { data: { user } } = await supabase.auth.getUser();
    // Providing all messages to the client
    // side is the easiest way to get started
    const messages = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$server$2f$react$2d$server$2f$getMessages$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__default__as__getMessages$3e$__["getMessages"])();
    const dir = locale === 'ar' ? 'rtl' : 'ltr';
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("html", {
        lang: locale,
        dir: dir,
        suppressHydrationWarning: true,
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("body", {
            className: `${__TURBOPACK__imported__module__$5b$next$5d2f$internal$2f$font$2f$google$2f$inter_5901b7c6$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"].variable} ${__TURBOPACK__imported__module__$5b$next$5d2f$internal$2f$font$2f$google$2f$outfit_8778cd42$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"].variable} ${__TURBOPACK__imported__module__$5b$next$5d2f$internal$2f$font$2f$google$2f$cairo_bd314a76$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"].variable} ${locale === 'ar' ? 'font-arabic' : 'font-sans'} bg-background text-text overflow-x-hidden`,
            suppressHydrationWarning: true,
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$components$2f$accessibility$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["SkipNavLink"], {}, void 0, false, {
                    fileName: "[project]/RiderProjects/SyriaHub/app/[locale]/layout.tsx",
                    lineNumber: 48,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$server$2f$NextIntlClientProviderServer$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__default__as__NextIntlClientProvider$3e$__["NextIntlClientProvider"], {
                    messages: messages,
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$components$2f$ui$2f$toast$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["ToastProvider"], {
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$contexts$2f$PreferencesContext$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["PreferencesProvider"], {
                            userId: user?.id,
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$components$2f$NotificationsProvider$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["NotificationsProvider"], {
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$components$2f$AppErrorBoundary$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["AppErrorBoundary"], {
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$components$2f$accessibility$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["SkipNavContent"], {
                                        children: children
                                    }, void 0, false, {
                                        fileName: "[project]/RiderProjects/SyriaHub/app/[locale]/layout.tsx",
                                        lineNumber: 54,
                                        columnNumber: 19
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/RiderProjects/SyriaHub/app/[locale]/layout.tsx",
                                    lineNumber: 53,
                                    columnNumber: 17
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/RiderProjects/SyriaHub/app/[locale]/layout.tsx",
                                lineNumber: 52,
                                columnNumber: 15
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/RiderProjects/SyriaHub/app/[locale]/layout.tsx",
                            lineNumber: 51,
                            columnNumber: 13
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/RiderProjects/SyriaHub/app/[locale]/layout.tsx",
                        lineNumber: 50,
                        columnNumber: 11
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/RiderProjects/SyriaHub/app/[locale]/layout.tsx",
                    lineNumber: 49,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/RiderProjects/SyriaHub/app/[locale]/layout.tsx",
            lineNumber: 47,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/RiderProjects/SyriaHub/app/[locale]/layout.tsx",
        lineNumber: 46,
        columnNumber: 5
    }, this);
}
function generateStaticParams() {
    return [
        {
            locale: 'en'
        },
        {
            locale: 'ar'
        }
    ];
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__ffbb9be0._.js.map