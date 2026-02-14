(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/RiderProjects/SyriaHub/lib/utils.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "cn",
    ()=>cn,
    "getAvatarGradient",
    ()=>getAvatarGradient,
    "getInitials",
    ()=>getInitials,
    "stripMarkdown",
    ()=>stripMarkdown
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$clsx$2f$dist$2f$clsx$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/RiderProjects/SyriaHub/node_modules/clsx/dist/clsx.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$tailwind$2d$merge$2f$dist$2f$bundle$2d$mjs$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/RiderProjects/SyriaHub/node_modules/tailwind-merge/dist/bundle-mjs.mjs [app-client] (ecmascript)");
;
;
function cn(...inputs) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$tailwind$2d$merge$2f$dist$2f$bundle$2d$mjs$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["twMerge"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$clsx$2f$dist$2f$clsx$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["clsx"])(inputs));
}
function stripMarkdown(markdown) {
    if (!markdown) return '';
    return markdown// Remove headers
    .replace(/^#+\s+/gm, '')// Remove images
    .replace(/!\[.*?\]\(.*?\)/g, '')// Remove links (keep text)
    .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1')// Remove bold/italic
    .replace(/(\*\*|__)(.*?)\1/g, '$2').replace(/(\*|_)(.*?)\1/g, '$2')// Remove blockquotes
    .replace(/^>\s+/gm, '')// Remove code blocks
    .replace(/```[\s\S]*?```/g, '')// Remove inline code
    .replace(/`([^`]+)`/g, '$1')// Remove horizontal rules
    .replace(/^-{3,}$/gm, '')// Simplify whitespace
    .replace(/\s+/g, ' ').trim();
}
function getInitials(name, email) {
    if (name) {
        return name.split(' ').map((n)=>n[0]).join('').toUpperCase().slice(0, 2);
    }
    if (email) {
        return email[0].toUpperCase();
    }
    return 'U';
}
function getAvatarGradient(id) {
    if (!id) return 'avatar-gradient-1';
    const gradients = [
        'avatar-gradient-1',
        'avatar-gradient-2',
        'avatar-gradient-3',
        'avatar-gradient-4',
        'avatar-gradient-5',
        'avatar-gradient-6',
        'avatar-gradient-7',
        'avatar-gradient-8'
    ];
    const index = id.charCodeAt(0) % gradients.length;
    return gradients[index];
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/RiderProjects/SyriaHub/components/ui/toast.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ToastProvider",
    ()=>ToastProvider,
    "useToast",
    ()=>useToast
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/RiderProjects/SyriaHub/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/RiderProjects/SyriaHub/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__ = __turbopack_context__.i("[project]/RiderProjects/SyriaHub/node_modules/lucide-react/dist/esm/icons/x.js [app-client] (ecmascript) <export default as X>");
var __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$check$2d$big$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__CheckCircle$3e$__ = __turbopack_context__.i("[project]/RiderProjects/SyriaHub/node_modules/lucide-react/dist/esm/icons/circle-check-big.js [app-client] (ecmascript) <export default as CheckCircle>");
var __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$alert$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__AlertCircle$3e$__ = __turbopack_context__.i("[project]/RiderProjects/SyriaHub/node_modules/lucide-react/dist/esm/icons/circle-alert.js [app-client] (ecmascript) <export default as AlertCircle>");
var __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$info$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Info$3e$__ = __turbopack_context__.i("[project]/RiderProjects/SyriaHub/node_modules/lucide-react/dist/esm/icons/info.js [app-client] (ecmascript) <export default as Info>");
var __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$triangle$2d$alert$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__AlertTriangle$3e$__ = __turbopack_context__.i("[project]/RiderProjects/SyriaHub/node_modules/lucide-react/dist/esm/icons/triangle-alert.js [app-client] (ecmascript) <export default as AlertTriangle>");
var __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/RiderProjects/SyriaHub/lib/utils.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature();
'use client';
;
;
;
const ToastContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createContext"])(undefined);
function useToast() {
    _s();
    const context = (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useContext"])(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within ToastProvider');
    }
    return context;
}
_s(useToast, "b9L3QQ+jgeyIrH0NfHrJ8nn7VMU=");
function ToastProvider({ children }) {
    _s1();
    const [toasts, setToasts] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const showToast = (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "ToastProvider.useCallback[showToast]": (message, type = 'info', duration = 5000)=>{
            const id = Math.random().toString(36).substr(2, 9);
            const toast = {
                id,
                type,
                message,
                duration
            };
            setToasts({
                "ToastProvider.useCallback[showToast]": (prev)=>[
                        ...prev,
                        toast
                    ]
            }["ToastProvider.useCallback[showToast]"]);
            if (duration > 0) {
                setTimeout({
                    "ToastProvider.useCallback[showToast]": ()=>{
                        setToasts({
                            "ToastProvider.useCallback[showToast]": (prev)=>prev.filter({
                                    "ToastProvider.useCallback[showToast]": (t)=>t.id !== id
                                }["ToastProvider.useCallback[showToast]"])
                        }["ToastProvider.useCallback[showToast]"]);
                    }
                }["ToastProvider.useCallback[showToast]"], duration);
            }
        }
    }["ToastProvider.useCallback[showToast]"], []);
    const removeToast = (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "ToastProvider.useCallback[removeToast]": (id)=>{
            setToasts({
                "ToastProvider.useCallback[removeToast]": (prev)=>prev.filter({
                        "ToastProvider.useCallback[removeToast]": (t)=>t.id !== id
                    }["ToastProvider.useCallback[removeToast]"])
            }["ToastProvider.useCallback[removeToast]"]);
        }
    }["ToastProvider.useCallback[removeToast]"], []);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(ToastContext.Provider, {
        value: {
            showToast
        },
        children: [
            children,
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "fixed top-4 right-4 z-[100] flex flex-col gap-2 max-w-md",
                children: toasts.map((toast)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(ToastItem, {
                        toast: toast,
                        onClose: ()=>removeToast(toast.id)
                    }, toast.id, false, {
                        fileName: "[project]/RiderProjects/SyriaHub/components/ui/toast.tsx",
                        lineNumber: 55,
                        columnNumber: 11
                    }, this))
            }, void 0, false, {
                fileName: "[project]/RiderProjects/SyriaHub/components/ui/toast.tsx",
                lineNumber: 53,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/RiderProjects/SyriaHub/components/ui/toast.tsx",
        lineNumber: 51,
        columnNumber: 5
    }, this);
}
_s1(ToastProvider, "pXAZjnBFZY5Qx0ETgnygSV3ABdc=");
_c = ToastProvider;
function ToastItem({ toast, onClose }) {
    const icons = {
        success: __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$check$2d$big$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__CheckCircle$3e$__["CheckCircle"],
        error: __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$alert$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__AlertCircle$3e$__["AlertCircle"],
        info: __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$info$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Info$3e$__["Info"],
        warning: __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$triangle$2d$alert$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__AlertTriangle$3e$__["AlertTriangle"]
    };
    const styles = {
        success: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-200',
        error: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200',
        info: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200',
        warning: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-200'
    };
    const Icon = icons[toast.type];
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])('flex items-start gap-3 p-4 rounded-lg border shadow-lg animate-slide-in-right', styles[toast.type]),
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Icon, {
                className: "w-5 h-5 mt-0.5 flex-shrink-0"
            }, void 0, false, {
                fileName: "[project]/RiderProjects/SyriaHub/components/ui/toast.tsx",
                lineNumber: 86,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "flex-1 text-sm font-medium",
                children: toast.message
            }, void 0, false, {
                fileName: "[project]/RiderProjects/SyriaHub/components/ui/toast.tsx",
                lineNumber: 87,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                onClick: onClose,
                className: "flex-shrink-0 hover:opacity-70 transition-opacity",
                "aria-label": "Close notification",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__["X"], {
                    className: "w-4 h-4"
                }, void 0, false, {
                    fileName: "[project]/RiderProjects/SyriaHub/components/ui/toast.tsx",
                    lineNumber: 93,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/RiderProjects/SyriaHub/components/ui/toast.tsx",
                lineNumber: 88,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/RiderProjects/SyriaHub/components/ui/toast.tsx",
        lineNumber: 80,
        columnNumber: 5
    }, this);
}
_c1 = ToastItem;
var _c, _c1;
__turbopack_context__.k.register(_c, "ToastProvider");
__turbopack_context__.k.register(_c1, "ToastItem");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/RiderProjects/SyriaHub/lib/supabase/client.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "createClient",
    ()=>createClient
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/RiderProjects/SyriaHub/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$supabase$2f$ssr$2f$dist$2f$module$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/RiderProjects/SyriaHub/node_modules/@supabase/ssr/dist/module/index.js [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$supabase$2f$ssr$2f$dist$2f$module$2f$createBrowserClient$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/RiderProjects/SyriaHub/node_modules/@supabase/ssr/dist/module/createBrowserClient.js [app-client] (ecmascript)");
;
function createClient() {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$supabase$2f$ssr$2f$dist$2f$module$2f$createBrowserClient$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createBrowserClient"])(("TURBOPACK compile-time value", "https://bwrdwbmhxtrghyrrfofb.supabase.co"), ("TURBOPACK compile-time value", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ3cmR3Ym1oeHRyZ2h5cnJmb2ZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg5NzU1NzMsImV4cCI6MjA3NDU1MTU3M30.yf4aP7pq_QkhRx_4nacfCcZ6mSsPtE3LeHw442gyv9U"));
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/RiderProjects/SyriaHub/components/NotificationsProvider.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "NotificationsProvider",
    ()=>NotificationsProvider,
    "useNotifications",
    ()=>useNotifications
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/RiderProjects/SyriaHub/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/RiderProjects/SyriaHub/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$lib$2f$supabase$2f$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/RiderProjects/SyriaHub/lib/supabase/client.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$components$2f$ui$2f$toast$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/RiderProjects/SyriaHub/components/ui/toast.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/RiderProjects/SyriaHub/node_modules/next/navigation.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature();
'use client';
;
;
;
;
const NotificationsContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createContext"])(undefined);
function NotificationsProvider({ children }) {
    _s();
    const [notifications, setNotifications] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [userId, setUserId] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$lib$2f$supabase$2f$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createClient"])();
    const { showToast } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$components$2f$ui$2f$toast$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useToast"])();
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"])();
    // Fetch initial user
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "NotificationsProvider.useEffect": ()=>{
            supabase.auth.getUser().then({
                "NotificationsProvider.useEffect": ({ data })=>{
                    setUserId(data.user?.id || null);
                }
            }["NotificationsProvider.useEffect"]);
        }
    }["NotificationsProvider.useEffect"], [
        supabase
    ]);
    // Fetch notifications and subscribe to realtime
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "NotificationsProvider.useEffect": ()=>{
            if (!userId) return;
            // Initial fetch
            const fetchNotifications = {
                "NotificationsProvider.useEffect.fetchNotifications": async ()=>{
                    const { data } = await supabase.from('notifications').select('*').eq('user_id', userId).order('created_at', {
                        ascending: false
                    }).limit(20);
                    if (data) setNotifications(data);
                }
            }["NotificationsProvider.useEffect.fetchNotifications"];
            fetchNotifications();
            // Realtime subscription
            const channel = supabase.channel('notifications').on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'notifications',
                filter: `user_id=eq.${userId}`
            }, {
                "NotificationsProvider.useEffect.channel": (payload)=>{
                    const newNotification = payload.new;
                    setNotifications({
                        "NotificationsProvider.useEffect.channel": (prev)=>[
                                newNotification,
                                ...prev
                            ]
                    }["NotificationsProvider.useEffect.channel"]);
                    showToast(newNotification.content, 'info');
                }
            }["NotificationsProvider.useEffect.channel"]).subscribe();
            return ({
                "NotificationsProvider.useEffect": ()=>{
                    supabase.removeChannel(channel);
                }
            })["NotificationsProvider.useEffect"];
        }
    }["NotificationsProvider.useEffect"], [
        userId,
        supabase,
        showToast
    ]);
    const markAsRead = async (id)=>{
        // Optimistic update
        setNotifications((prev)=>prev.map((n)=>n.id === id ? {
                    ...n,
                    is_read: true
                } : n));
        await supabase.from('notifications').update({
            is_read: true
        }).eq('id', id);
    };
    const markAllAsRead = async ()=>{
        // Optimistic update
        setNotifications((prev)=>prev.map((n)=>({
                    ...n,
                    is_read: true
                })));
        await supabase.from('notifications').update({
            is_read: true
        }).eq('user_id', userId).eq('is_read', false);
    };
    const unreadCount = notifications.filter((n)=>!n.is_read).length;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(NotificationsContext.Provider, {
        value: {
            notifications,
            unreadCount,
            markAsRead,
            markAllAsRead
        },
        children: children
    }, void 0, false, {
        fileName: "[project]/RiderProjects/SyriaHub/components/NotificationsProvider.tsx",
        lineNumber: 109,
        columnNumber: 9
    }, this);
}
_s(NotificationsProvider, "3WPNDkMH5uMfvltlI0dKSIZcBGk=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$components$2f$ui$2f$toast$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useToast"],
        __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"]
    ];
});
_c = NotificationsProvider;
const useNotifications = ()=>{
    _s1();
    const context = (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useContext"])(NotificationsContext);
    if (context === undefined) {
        throw new Error('useNotifications must be used within a NotificationsProvider');
    }
    return context;
};
_s1(useNotifications, "b9L3QQ+jgeyIrH0NfHrJ8nn7VMU=");
var _c;
__turbopack_context__.k.register(_c, "NotificationsProvider");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/RiderProjects/SyriaHub/components/ui/button.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Button",
    ()=>Button
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/RiderProjects/SyriaHub/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/RiderProjects/SyriaHub/lib/utils.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/RiderProjects/SyriaHub/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
;
;
;
const Button = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["forwardRef"])(_c = ({ className, variant = 'default', size = 'default', ...props }, ref)=>{
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
        ref: ref,
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])('inline-flex items-center justify-center rounded-lg font-medium transition-all btn-press', 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2', 'disabled:pointer-events-none disabled:opacity-50', {
            'bg-primary text-white hover:bg-primary-dark dark:bg-primary-light dark:hover:bg-primary focus-visible:ring-primary': variant === 'default',
            'border-2 border-gray-300 dark:border-dark-border text-text dark:text-dark-text hover:border-primary dark:hover:border-primary-light': variant === 'outline',
            'text-text dark:text-dark-text hover:bg-gray-100 dark:hover:bg-dark-surface': variant === 'ghost',
            'bg-accent text-white hover:bg-accent-dark focus-visible:ring-accent': variant === 'destructive'
        }, {
            'h-10 px-4 py-2': size === 'default',
            'h-8 px-3 text-sm': size === 'sm',
            'h-12 px-6 text-lg': size === 'lg',
            'h-10 w-10': size === 'icon'
        }, className),
        ...props
    }, void 0, false, {
        fileName: "[project]/RiderProjects/SyriaHub/components/ui/button.tsx",
        lineNumber: 12,
        columnNumber: 7
    }, ("TURBOPACK compile-time value", void 0));
});
_c1 = Button;
Button.displayName = 'Button';
;
var _c, _c1;
__turbopack_context__.k.register(_c, "Button$forwardRef");
__turbopack_context__.k.register(_c1, "Button");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/RiderProjects/SyriaHub/components/ErrorBoundary.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ErrorBoundary",
    ()=>ErrorBoundary,
    "ErrorFallback",
    ()=>ErrorFallback,
    "InlineError",
    ()=>InlineError,
    "LoadingError",
    ()=>LoadingError
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/RiderProjects/SyriaHub/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/RiderProjects/SyriaHub/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/RiderProjects/SyriaHub/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$triangle$2d$alert$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__AlertTriangle$3e$__ = __turbopack_context__.i("[project]/RiderProjects/SyriaHub/node_modules/lucide-react/dist/esm/icons/triangle-alert.js [app-client] (ecmascript) <export default as AlertTriangle>");
var __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$refresh$2d$cw$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__RefreshCw$3e$__ = __turbopack_context__.i("[project]/RiderProjects/SyriaHub/node_modules/lucide-react/dist/esm/icons/refresh-cw.js [app-client] (ecmascript) <export default as RefreshCw>");
var __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$house$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Home$3e$__ = __turbopack_context__.i("[project]/RiderProjects/SyriaHub/node_modules/lucide-react/dist/esm/icons/house.js [app-client] (ecmascript) <export default as Home>");
var __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$arrow$2d$left$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ArrowLeft$3e$__ = __turbopack_context__.i("[project]/RiderProjects/SyriaHub/node_modules/lucide-react/dist/esm/icons/arrow-left.js [app-client] (ecmascript) <export default as ArrowLeft>");
var __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$wifi$2d$off$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__WifiOff$3e$__ = __turbopack_context__.i("[project]/RiderProjects/SyriaHub/node_modules/lucide-react/dist/esm/icons/wifi-off.js [app-client] (ecmascript) <export default as WifiOff>");
var __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$shield$2d$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ShieldX$3e$__ = __turbopack_context__.i("[project]/RiderProjects/SyriaHub/node_modules/lucide-react/dist/esm/icons/shield-x.js [app-client] (ecmascript) <export default as ShieldX>");
var __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$file$2d$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__FileX$3e$__ = __turbopack_context__.i("[project]/RiderProjects/SyriaHub/node_modules/lucide-react/dist/esm/icons/file-x.js [app-client] (ecmascript) <export default as FileX>");
var __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/RiderProjects/SyriaHub/components/ui/button.tsx [app-client] (ecmascript)");
'use client';
;
;
;
;
class ErrorBoundary extends __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Component"] {
    constructor(props){
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null
        };
    }
    static getDerivedStateFromError(error) {
        return {
            hasError: true,
            error
        };
    }
    componentDidCatch(error, errorInfo) {
        console.error('Error caught by boundary:', error, errorInfo);
        this.setState({
            errorInfo
        });
    // Optional: Send to error tracking service
    // logErrorToService(error, errorInfo)
    }
    handleReset = ()=>{
        this.setState({
            hasError: false,
            error: null,
            errorInfo: null
        });
        this.props.onReset?.();
    };
    handleReload = ()=>{
        window.location.reload();
    };
    handleGoHome = ()=>{
        window.location.href = '/feed';
    };
    handleGoBack = ()=>{
        window.history.back();
    };
    render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }
            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(ErrorFallback, {
                error: this.state.error,
                onRetry: this.handleReset,
                onReload: this.handleReload,
                onGoHome: this.handleGoHome,
                onGoBack: this.handleGoBack
            }, void 0, false, {
                fileName: "[project]/RiderProjects/SyriaHub/components/ErrorBoundary.tsx",
                lineNumber: 61,
                columnNumber: 17
            }, this);
        }
        return this.props.children;
    }
}
function detectErrorType(error) {
    if (!error) return 'generic';
    const message = error.message.toLowerCase();
    const name = error.name.toLowerCase();
    if (message.includes('network') || message.includes('fetch') || message.includes('failed to load')) {
        return 'network';
    }
    if (message.includes('unauthorized') || message.includes('403') || message.includes('401') || message.includes('auth')) {
        return 'auth';
    }
    if (message.includes('not found') || message.includes('404')) {
        return 'notFound';
    }
    return 'generic';
}
function ErrorFallback({ error, onRetry, onReload, onGoHome, onGoBack }) {
    const errorType = detectErrorType(error);
    const errorConfig = {
        network: {
            icon: __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$wifi$2d$off$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__WifiOff$3e$__["WifiOff"],
            title: 'Connection Lost',
            description: 'It seems you are offline. Check your internet connection and try again.',
            color: 'text-amber-500',
            bgGradient: 'from-amber-500/20 to-orange-500/5',
            borderColor: 'border-amber-200 dark:border-amber-900/30'
        },
        auth: {
            icon: __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$shield$2d$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ShieldX$3e$__["ShieldX"],
            title: 'Access Restricted',
            description: "You don't have permission to access this area. Please sign in or contact an administrator.",
            color: 'text-red-500',
            bgGradient: 'from-red-500/20 to-rose-500/5',
            borderColor: 'border-red-200 dark:border-red-900/30'
        },
        notFound: {
            icon: __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$file$2d$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__FileX$3e$__["FileX"],
            title: 'Page Not Found',
            description: "The page you're looking for doesn't exist or has been moved.",
            color: 'text-blue-500',
            bgGradient: 'from-blue-500/20 to-cyan-500/5',
            borderColor: 'border-blue-200 dark:border-blue-900/30'
        },
        generic: {
            icon: __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$triangle$2d$alert$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__AlertTriangle$3e$__["AlertTriangle"],
            title: 'Something Went Wrong',
            description: 'We encountered an unexpected error. Our team has been notified.',
            color: 'text-rose-500',
            bgGradient: 'from-rose-500/20 to-pink-500/5',
            borderColor: 'border-rose-200 dark:border-rose-900/30'
        }
    };
    const config = errorConfig[errorType];
    const Icon = config.icon;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "min-h-screen flex items-center justify-center p-6 bg-gray-50/50 dark:bg-dark-bg relative overflow-hidden",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "absolute inset-0 bg-grid-slate-900/[0.04] dark:bg-grid-slate-100/[0.04] [mask-image:radial-gradient(ellipse_at_center,black_70%,transparent_100%)] pointer-events-none"
            }, void 0, false, {
                fileName: "[project]/RiderProjects/SyriaHub/components/ErrorBoundary.tsx",
                lineNumber: 148,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "relative max-w-lg w-full text-center",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "bg-white dark:bg-dark-surface/80 backdrop-blur-xl rounded-3xl shadow-2xl shadow-gray-200/50 dark:shadow-black/20 border border-gray-200 dark:border-dark-border p-8 md:p-12 overflow-hidden",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: `absolute top-0 inset-x-0 h-32 bg-gradient-to-b ${config.bgGradient} opacity-30`
                            }, void 0, false, {
                                fileName: "[project]/RiderProjects/SyriaHub/components/ErrorBoundary.tsx",
                                lineNumber: 155,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "relative mb-8 inline-flex",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: `absolute inset-0 ${config.color} blur-2xl opacity-20 transform scale-150 animate-pulse`
                                    }, void 0, false, {
                                        fileName: "[project]/RiderProjects/SyriaHub/components/ErrorBoundary.tsx",
                                        lineNumber: 159,
                                        columnNumber: 25
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: `relative px-6 py-6 rounded-2xl bg-white dark:bg-dark-bg border ${config.borderColor} shadow-sm z-10`,
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Icon, {
                                            className: `w-12 h-12 ${config.color}`
                                        }, void 0, false, {
                                            fileName: "[project]/RiderProjects/SyriaHub/components/ErrorBoundary.tsx",
                                            lineNumber: 161,
                                            columnNumber: 29
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/RiderProjects/SyriaHub/components/ErrorBoundary.tsx",
                                        lineNumber: 160,
                                        columnNumber: 25
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/RiderProjects/SyriaHub/components/ErrorBoundary.tsx",
                                lineNumber: 158,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "relative z-10 space-y-4",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                        className: "text-3xl md:text-4xl font-display font-bold text-text dark:text-dark-text tracking-tight",
                                        children: config.title
                                    }, void 0, false, {
                                        fileName: "[project]/RiderProjects/SyriaHub/components/ErrorBoundary.tsx",
                                        lineNumber: 167,
                                        columnNumber: 25
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-lg text-text-light dark:text-dark-text-muted leading-relaxed max-w-sm mx-auto",
                                        children: config.description
                                    }, void 0, false, {
                                        fileName: "[project]/RiderProjects/SyriaHub/components/ErrorBoundary.tsx",
                                        lineNumber: 171,
                                        columnNumber: 25
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "pt-8 flex flex-col sm:flex-row gap-4 justify-center items-center",
                                        children: [
                                            onRetry && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                                onClick: onRetry,
                                                size: "lg",
                                                className: "w-full sm:w-auto min-w-[140px] font-semibold shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$refresh$2d$cw$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__RefreshCw$3e$__["RefreshCw"], {
                                                        className: "w-4 h-4 mr-2"
                                                    }, void 0, false, {
                                                        fileName: "[project]/RiderProjects/SyriaHub/components/ErrorBoundary.tsx",
                                                        lineNumber: 183,
                                                        columnNumber: 37
                                                    }, this),
                                                    "Try Again"
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/RiderProjects/SyriaHub/components/ErrorBoundary.tsx",
                                                lineNumber: 178,
                                                columnNumber: 33
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex gap-4 w-full sm:w-auto",
                                                children: [
                                                    onGoBack && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                                        variant: "outline",
                                                        onClick: onGoBack,
                                                        size: "lg",
                                                        className: "flex-1 sm:flex-none border-gray-200 dark:border-dark-border hover:bg-gray-50 dark:hover:bg-dark-bg",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$arrow$2d$left$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ArrowLeft$3e$__["ArrowLeft"], {
                                                                className: "w-4 h-4 mr-2"
                                                            }, void 0, false, {
                                                                fileName: "[project]/RiderProjects/SyriaHub/components/ErrorBoundary.tsx",
                                                                lineNumber: 196,
                                                                columnNumber: 41
                                                            }, this),
                                                            "Back"
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/RiderProjects/SyriaHub/components/ErrorBoundary.tsx",
                                                        lineNumber: 190,
                                                        columnNumber: 37
                                                    }, this),
                                                    onGoHome && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                                        variant: "ghost",
                                                        onClick: onGoHome,
                                                        size: "lg",
                                                        className: "flex-1 sm:flex-none text-text-light dark:text-dark-text-muted hover:text-primary dark:hover:text-primary-light",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$house$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Home$3e$__["Home"], {
                                                                className: "w-4 h-4 mr-2"
                                                            }, void 0, false, {
                                                                fileName: "[project]/RiderProjects/SyriaHub/components/ErrorBoundary.tsx",
                                                                lineNumber: 207,
                                                                columnNumber: 41
                                                            }, this),
                                                            "Home"
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/RiderProjects/SyriaHub/components/ErrorBoundary.tsx",
                                                        lineNumber: 201,
                                                        columnNumber: 37
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/RiderProjects/SyriaHub/components/ErrorBoundary.tsx",
                                                lineNumber: 188,
                                                columnNumber: 29
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/RiderProjects/SyriaHub/components/ErrorBoundary.tsx",
                                        lineNumber: 176,
                                        columnNumber: 25
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/RiderProjects/SyriaHub/components/ErrorBoundary.tsx",
                                lineNumber: 166,
                                columnNumber: 21
                            }, this),
                            error && ("TURBOPACK compile-time value", "development") === 'development' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "mt-8 pt-6 border-t border-gray-100 dark:border-dark-border/50 relative z-10",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("details", {
                                    className: "group text-left",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("summary", {
                                            className: "flex items-center justify-center gap-2 cursor-pointer text-xs font-medium text-text-light dark:text-dark-text-muted uppercase tracking-wider hover:text-primary transition-colors p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-dark-bg/50 w-fit mx-auto",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$shield$2d$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ShieldX$3e$__["ShieldX"], {
                                                    className: "w-3.5 h-3.5"
                                                }, void 0, false, {
                                                    fileName: "[project]/RiderProjects/SyriaHub/components/ErrorBoundary.tsx",
                                                    lineNumber: 220,
                                                    columnNumber: 37
                                                }, this),
                                                "Technical Details"
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/RiderProjects/SyriaHub/components/ErrorBoundary.tsx",
                                            lineNumber: 219,
                                            columnNumber: 33
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "mt-4 animate-in fade-in slide-in-from-top-2 duration-200",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("pre", {
                                                className: "p-4 bg-gray-50 dark:bg-dark-bg rounded-xl border border-gray-100 dark:border-dark-border overflow-x-auto text-xs font-mono leading-relaxed text-left shadow-inner",
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("code", {
                                                    className: "block text-rose-600 dark:text-rose-400 break-words whitespace-pre-wrap",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "font-bold",
                                                            children: [
                                                                error.name,
                                                                ":"
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/RiderProjects/SyriaHub/components/ErrorBoundary.tsx",
                                                            lineNumber: 226,
                                                            columnNumber: 45
                                                        }, this),
                                                        " ",
                                                        error.message,
                                                        error.stack && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "text-text-muted dark:text-dark-text-muted/70 mt-2 block border-t border-dashed border-gray-200 dark:border-dark-border pt-2",
                                                            children: error.stack
                                                        }, void 0, false, {
                                                            fileName: "[project]/RiderProjects/SyriaHub/components/ErrorBoundary.tsx",
                                                            lineNumber: 228,
                                                            columnNumber: 49
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/RiderProjects/SyriaHub/components/ErrorBoundary.tsx",
                                                    lineNumber: 225,
                                                    columnNumber: 41
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/RiderProjects/SyriaHub/components/ErrorBoundary.tsx",
                                                lineNumber: 224,
                                                columnNumber: 37
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/RiderProjects/SyriaHub/components/ErrorBoundary.tsx",
                                            lineNumber: 223,
                                            columnNumber: 33
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/RiderProjects/SyriaHub/components/ErrorBoundary.tsx",
                                    lineNumber: 218,
                                    columnNumber: 29
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/RiderProjects/SyriaHub/components/ErrorBoundary.tsx",
                                lineNumber: 217,
                                columnNumber: 25
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/RiderProjects/SyriaHub/components/ErrorBoundary.tsx",
                        lineNumber: 152,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "mt-8 text-sm text-text-light dark:text-dark-text-muted",
                        children: [
                            "Need help? ",
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                                href: "mailto:support@syrealize.com",
                                className: "text-primary hover:underline font-medium",
                                children: "Contact Support"
                            }, void 0, false, {
                                fileName: "[project]/RiderProjects/SyriaHub/components/ErrorBoundary.tsx",
                                lineNumber: 242,
                                columnNumber: 32
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/RiderProjects/SyriaHub/components/ErrorBoundary.tsx",
                        lineNumber: 241,
                        columnNumber: 17
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/RiderProjects/SyriaHub/components/ErrorBoundary.tsx",
                lineNumber: 150,
                columnNumber: 13
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/RiderProjects/SyriaHub/components/ErrorBoundary.tsx",
        lineNumber: 146,
        columnNumber: 9
    }, this);
}
_c = ErrorFallback;
function InlineError({ message, onRetry }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$triangle$2d$alert$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__AlertTriangle$3e$__["AlertTriangle"], {
                className: "w-5 h-5 text-red-500 flex-shrink-0"
            }, void 0, false, {
                fileName: "[project]/RiderProjects/SyriaHub/components/ErrorBoundary.tsx",
                lineNumber: 258,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "text-sm text-red-700 dark:text-red-300 flex-1",
                children: message
            }, void 0, false, {
                fileName: "[project]/RiderProjects/SyriaHub/components/ErrorBoundary.tsx",
                lineNumber: 259,
                columnNumber: 13
            }, this),
            onRetry && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                variant: "ghost",
                size: "sm",
                onClick: onRetry,
                className: "text-red-600 hover:text-red-700 hover:bg-red-100 dark:hover:bg-red-900/30",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$refresh$2d$cw$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__RefreshCw$3e$__["RefreshCw"], {
                    className: "w-4 h-4"
                }, void 0, false, {
                    fileName: "[project]/RiderProjects/SyriaHub/components/ErrorBoundary.tsx",
                    lineNumber: 267,
                    columnNumber: 21
                }, this)
            }, void 0, false, {
                fileName: "[project]/RiderProjects/SyriaHub/components/ErrorBoundary.tsx",
                lineNumber: 261,
                columnNumber: 17
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/RiderProjects/SyriaHub/components/ErrorBoundary.tsx",
        lineNumber: 257,
        columnNumber: 9
    }, this);
}
_c1 = InlineError;
function LoadingError({ title = 'Failed to load', message = 'Something went wrong while loading this content.', onRetry }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "flex flex-col items-center justify-center py-16 px-4 text-center rounded-3xl bg-gray-50/50 dark:bg-dark-surface/50 border border-gray-100 dark:border-dark-border/50",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "w-16 h-16 mb-4 rounded-2xl bg-white dark:bg-dark-bg border border-gray-100 dark:border-dark-border shadow-sm flex items-center justify-center",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$triangle$2d$alert$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__AlertTriangle$3e$__["AlertTriangle"], {
                    className: "w-8 h-8 text-rose-500"
                }, void 0, false, {
                    fileName: "[project]/RiderProjects/SyriaHub/components/ErrorBoundary.tsx",
                    lineNumber: 289,
                    columnNumber: 17
                }, this)
            }, void 0, false, {
                fileName: "[project]/RiderProjects/SyriaHub/components/ErrorBoundary.tsx",
                lineNumber: 288,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                className: "text-lg font-bold text-text dark:text-dark-text mb-2",
                children: title
            }, void 0, false, {
                fileName: "[project]/RiderProjects/SyriaHub/components/ErrorBoundary.tsx",
                lineNumber: 291,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "text-sm text-text-light dark:text-dark-text-muted mb-6 max-w-xs",
                children: message
            }, void 0, false, {
                fileName: "[project]/RiderProjects/SyriaHub/components/ErrorBoundary.tsx",
                lineNumber: 292,
                columnNumber: 13
            }, this),
            onRetry && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                variant: "outline",
                onClick: onRetry,
                className: "gap-2 bg-white dark:bg-dark-bg hover:bg-gray-50 dark:hover:bg-dark-surface border-gray-200 dark:border-dark-border",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$refresh$2d$cw$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__RefreshCw$3e$__["RefreshCw"], {
                        className: "w-4 h-4"
                    }, void 0, false, {
                        fileName: "[project]/RiderProjects/SyriaHub/components/ErrorBoundary.tsx",
                        lineNumber: 295,
                        columnNumber: 21
                    }, this),
                    "Try Again"
                ]
            }, void 0, true, {
                fileName: "[project]/RiderProjects/SyriaHub/components/ErrorBoundary.tsx",
                lineNumber: 294,
                columnNumber: 17
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/RiderProjects/SyriaHub/components/ErrorBoundary.tsx",
        lineNumber: 287,
        columnNumber: 9
    }, this);
}
_c2 = LoadingError;
;
var _c, _c1, _c2;
__turbopack_context__.k.register(_c, "ErrorFallback");
__turbopack_context__.k.register(_c1, "InlineError");
__turbopack_context__.k.register(_c2, "LoadingError");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/RiderProjects/SyriaHub/components/AppErrorBoundary.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "AppErrorBoundary",
    ()=>AppErrorBoundary
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/RiderProjects/SyriaHub/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$components$2f$ErrorBoundary$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/RiderProjects/SyriaHub/components/ErrorBoundary.tsx [app-client] (ecmascript)");
'use client';
;
;
function AppErrorBoundary({ children }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$components$2f$ErrorBoundary$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ErrorBoundary"], {
        onReset: ()=>{
            // Clear any cached data or reset app state
            if (("TURBOPACK compile-time value", "object") !== 'undefined') {
            // Could clear localStorage caches here if needed
            }
        },
        children: children
    }, void 0, false, {
        fileName: "[project]/RiderProjects/SyriaHub/components/AppErrorBoundary.tsx",
        lineNumber: 12,
        columnNumber: 9
    }, this);
}
_c = AppErrorBoundary;
var _c;
__turbopack_context__.k.register(_c, "AppErrorBoundary");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/RiderProjects/SyriaHub/contexts/PreferencesContext.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "PreferencesProvider",
    ()=>PreferencesProvider,
    "usePreferences",
    ()=>usePreferences,
    "useTheme",
    ()=>useTheme
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/RiderProjects/SyriaHub/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/RiderProjects/SyriaHub/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$lib$2f$supabase$2f$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/RiderProjects/SyriaHub/lib/supabase/client.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature(), _s2 = __turbopack_context__.k.signature();
'use client';
;
;
const defaultPreferences = {
    theme: 'system',
    language: 'en',
    notifications: {
        email_mentions: true,
        email_replies: true,
        email_follows: false,
        email_digest: 'weekly',
        push_enabled: false,
        push_mentions: true,
        push_replies: true
    },
    display: {
        compact_mode: false,
        show_avatars: true,
        posts_per_page: 20,
        default_sort: 'recent'
    },
    privacy: {
        show_profile_public: true,
        show_email: false,
        allow_messages: true
    },
    editor: {
        autosave: true,
        autosave_interval: 30,
        spellcheck: true,
        line_numbers: false
    }
};
const PreferencesContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createContext"])(undefined);
function usePreferences() {
    _s();
    const context = (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useContext"])(PreferencesContext);
    if (!context) {
        throw new Error('usePreferences must be used within PreferencesProvider');
    }
    return context;
}
_s(usePreferences, "b9L3QQ+jgeyIrH0NfHrJ8nn7VMU=");
function PreferencesProvider({ children, userId }) {
    _s1();
    const [preferences, setPreferences] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(defaultPreferences);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true);
    const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$lib$2f$supabase$2f$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createClient"])();
    // Load preferences from localStorage and database
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "PreferencesProvider.useEffect": ()=>{
            async function loadPreferences() {
                // First, load from localStorage for immediate use
                const localPrefs = localStorage.getItem('user_preferences');
                if (localPrefs) {
                    try {
                        const parsed = JSON.parse(localPrefs);
                        setPreferences({
                            "PreferencesProvider.useEffect.loadPreferences": (prev)=>({
                                    ...prev,
                                    ...parsed
                                })
                        }["PreferencesProvider.useEffect.loadPreferences"]);
                    } catch (error) {
                        console.error('Failed to parse local preferences:', error);
                    }
                }
                // If user is logged in, sync with database
                if (userId) {
                    try {
                        const { data, error } = await supabase.from('user_preferences').select('preferences').eq('user_id', userId).single();
                        if (data?.preferences) {
                            const dbPrefs = data.preferences;
                            setPreferences({
                                "PreferencesProvider.useEffect.loadPreferences": (prev)=>({
                                        ...prev,
                                        ...dbPrefs
                                    })
                            }["PreferencesProvider.useEffect.loadPreferences"]);
                            localStorage.setItem('user_preferences', JSON.stringify(dbPrefs));
                        }
                    } catch (error) {
                        // Preferences might not exist yet, that's okay
                        console.log('No database preferences found, using defaults');
                    }
                }
                setLoading(false);
            }
            loadPreferences();
        }
    }["PreferencesProvider.useEffect"], [
        userId,
        supabase
    ]);
    // Apply theme preference
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "PreferencesProvider.useEffect": ()=>{
            // Guard for SSR
            if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
            ;
            const root = document.documentElement;
            // Clean up old 'theme' localStorage key from legacy Navbar logic
            const oldTheme = localStorage.getItem('theme');
            if (oldTheme) {
                localStorage.removeItem('theme');
            }
            if (preferences.theme === 'system') {
                const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
                const systemDark = mediaQuery.matches;
                console.log('[Theme] System mode - detected system prefers-dark:', systemDark);
                root.classList.toggle('dark', systemDark);
                // Listen for system theme changes
                const listener = {
                    "PreferencesProvider.useEffect.listener": (e)=>{
                        if (preferences.theme === 'system') {
                            console.log('[Theme] System preference changed to:', e.matches ? 'dark' : 'light');
                            root.classList.toggle('dark', e.matches);
                        }
                    }
                }["PreferencesProvider.useEffect.listener"];
                mediaQuery.addEventListener('change', listener);
                return ({
                    "PreferencesProvider.useEffect": ()=>mediaQuery.removeEventListener('change', listener)
                })["PreferencesProvider.useEffect"];
            } else {
                console.log('[Theme] Manual mode:', preferences.theme);
                root.classList.toggle('dark', preferences.theme === 'dark');
            }
        }
    }["PreferencesProvider.useEffect"], [
        preferences.theme
    ]);
    const savePreferences = (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "PreferencesProvider.useCallback[savePreferences]": async (newPrefs)=>{
            // Save to localStorage immediately
            localStorage.setItem('user_preferences', JSON.stringify(newPrefs));
            // Save to database if user is logged in
            if (userId) {
                try {
                    await supabase.from('user_preferences').upsert({
                        user_id: userId,
                        preferences: newPrefs,
                        updated_at: new Date().toISOString()
                    });
                } catch (error) {
                    console.error('Failed to save preferences to database:', error);
                }
            }
        }
    }["PreferencesProvider.useCallback[savePreferences]"], [
        userId,
        supabase
    ]);
    const updatePreference = (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "PreferencesProvider.useCallback[updatePreference]": async (key, value)=>{
            console.log('[Preferences] Updating:', key, '=', value);
            const newPrefs = {
                ...preferences,
                [key]: value
            };
            setPreferences(newPrefs);
            await savePreferences(newPrefs);
        }
    }["PreferencesProvider.useCallback[updatePreference]"], [
        preferences,
        savePreferences
    ]);
    const updateNestedPreference = (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "PreferencesProvider.useCallback[updateNestedPreference]": async (key, nestedKey, value)=>{
            const newPrefs = {
                ...preferences,
                [key]: {
                    ...preferences[key],
                    [nestedKey]: value
                }
            };
            setPreferences(newPrefs);
            await savePreferences(newPrefs);
        }
    }["PreferencesProvider.useCallback[updateNestedPreference]"], [
        preferences,
        savePreferences
    ]);
    const resetToDefaults = (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "PreferencesProvider.useCallback[resetToDefaults]": async ()=>{
            setPreferences(defaultPreferences);
            await savePreferences(defaultPreferences);
        }
    }["PreferencesProvider.useCallback[resetToDefaults]"], [
        savePreferences
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(PreferencesContext.Provider, {
        value: {
            preferences,
            loading,
            updatePreference,
            updateNestedPreference,
            resetToDefaults
        },
        children: children
    }, void 0, false, {
        fileName: "[project]/RiderProjects/SyriaHub/contexts/PreferencesContext.tsx",
        lineNumber: 247,
        columnNumber: 9
    }, this);
}
_s1(PreferencesProvider, "P3qMsuVibRbyJtj2f7snBYFS/zU=");
_c = PreferencesProvider;
function useTheme() {
    _s2();
    const { preferences, updatePreference } = usePreferences();
    return {
        theme: preferences.theme,
        setTheme: (theme)=>updatePreference('theme', theme),
        isDark: preferences.theme === 'dark' || preferences.theme === 'system' && ("TURBOPACK compile-time value", "object") !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches
    };
}
_s2(useTheme, "4a3+V4wuoI5SgzfgrR8PryjOIZs=", false, function() {
    return [
        usePreferences
    ];
});
var _c;
__turbopack_context__.k.register(_c, "PreferencesProvider");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/RiderProjects/SyriaHub/components/accessibility.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

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
var __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/RiderProjects/SyriaHub/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
/**
 * Focus trap for modals and dialogs
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/RiderProjects/SyriaHub/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature(), _s2 = __turbopack_context__.k.signature(), _s3 = __turbopack_context__.k.signature();
'use client';
function SkipNavLink() {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
        href: "#main-content",
        className: "   sr-only focus:not-sr-only   fixed top-2 left-2 z-[100]   px-4 py-2    bg-primary text-white    rounded-lg    font-medium   focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary   transition-transform   -translate-y-full focus:translate-y-0   ",
        children: "Skip to main content"
    }, void 0, false, {
        fileName: "[project]/RiderProjects/SyriaHub/components/accessibility.tsx",
        lineNumber: 9,
        columnNumber: 9
    }, this);
}
_c = SkipNavLink;
function SkipNavContent({ children, className = '' }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("main", {
        id: "main-content",
        tabIndex: -1,
        className: `outline-none ${className}`,
        children: children
    }, void 0, false, {
        fileName: "[project]/RiderProjects/SyriaHub/components/accessibility.tsx",
        lineNumber: 33,
        columnNumber: 9
    }, this);
}
_c1 = SkipNavContent;
;
function FocusTrap({ children, active = true, returnFocusOnDeactivate = true }) {
    _s();
    const containerRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const previousActiveElement = (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "FocusTrap.useEffect": ()=>{
            if (!active) return;
            previousActiveElement.current = document.activeElement;
            const container = containerRef.current;
            if (!container) return;
            const focusableElements = container.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
            const firstElement = focusableElements[0];
            const lastElement = focusableElements[focusableElements.length - 1];
            // Focus first element
            firstElement?.focus();
            const handleKeyDown = {
                "FocusTrap.useEffect.handleKeyDown": (e)=>{
                    if (e.key !== 'Tab') return;
                    if (e.shiftKey) {
                        if (document.activeElement === firstElement) {
                            e.preventDefault();
                            lastElement?.focus();
                        }
                    } else {
                        if (document.activeElement === lastElement) {
                            e.preventDefault();
                            firstElement?.focus();
                        }
                    }
                }
            }["FocusTrap.useEffect.handleKeyDown"];
            document.addEventListener('keydown', handleKeyDown);
            return ({
                "FocusTrap.useEffect": ()=>{
                    document.removeEventListener('keydown', handleKeyDown);
                    if (returnFocusOnDeactivate && previousActiveElement.current instanceof HTMLElement) {
                        previousActiveElement.current.focus();
                    }
                }
            })["FocusTrap.useEffect"];
        }
    }["FocusTrap.useEffect"], [
        active,
        returnFocusOnDeactivate
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        ref: containerRef,
        children: children
    }, void 0, false, {
        fileName: "[project]/RiderProjects/SyriaHub/components/accessibility.tsx",
        lineNumber: 101,
        columnNumber: 12
    }, this);
}
_s(FocusTrap, "kiUoSAkS5H5rK6eQnj/Hpijqh/o=");
_c2 = FocusTrap;
function VisuallyHidden({ children }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
        className: "sr-only",
        children: children
    }, void 0, false, {
        fileName: "[project]/RiderProjects/SyriaHub/components/accessibility.tsx",
        lineNumber: 109,
        columnNumber: 9
    }, this);
}
_c3 = VisuallyHidden;
function LiveRegion({ message, politeness = 'polite' }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        role: "status",
        "aria-live": politeness,
        "aria-atomic": "true",
        className: "sr-only",
        children: message
    }, void 0, false, {
        fileName: "[project]/RiderProjects/SyriaHub/components/accessibility.tsx",
        lineNumber: 125,
        columnNumber: 9
    }, this);
}
_c4 = LiveRegion;
;
function useAnnounce() {
    _s1();
    const [message, setMessage] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const announce = (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "useAnnounce.useCallback[announce]": (text, delay = 100)=>{
            // Clear first to ensure re-announcement of same message
            setMessage('');
            setTimeout({
                "useAnnounce.useCallback[announce]": ()=>setMessage(text)
            }["useAnnounce.useCallback[announce]"], delay);
        }
    }["useAnnounce.useCallback[announce]"], []);
    const LiveRegionComponent = ()=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(LiveRegion, {
            message: message
        }, void 0, false, {
            fileName: "[project]/RiderProjects/SyriaHub/components/accessibility.tsx",
            lineNumber: 151,
            columnNumber: 9
        }, this);
    return {
        announce,
        LiveRegion: LiveRegionComponent
    };
}
_s1(useAnnounce, "UmEJRD9ogpIg1wG3+w7+x8JUg7c=");
function useKeyboardNavigation(items, options = {}) {
    _s2();
    const { orientation = 'vertical', wrap = true, onSelect } = options;
    const [activeIndex, setActiveIndex] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(0);
    const handleKeyDown = (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "useKeyboardNavigation.useCallback[handleKeyDown]": (e)=>{
            const length = items.length;
            if (length === 0) return;
            let newIndex = activeIndex;
            switch(e.key){
                case 'ArrowDown':
                    if (orientation !== 'horizontal') {
                        e.preventDefault();
                        newIndex = wrap ? (activeIndex + 1) % length : Math.min(activeIndex + 1, length - 1);
                    }
                    break;
                case 'ArrowUp':
                    if (orientation !== 'horizontal') {
                        e.preventDefault();
                        newIndex = wrap ? (activeIndex - 1 + length) % length : Math.max(activeIndex - 1, 0);
                    }
                    break;
                case 'ArrowRight':
                    if (orientation !== 'vertical') {
                        e.preventDefault();
                        newIndex = wrap ? (activeIndex + 1) % length : Math.min(activeIndex + 1, length - 1);
                    }
                    break;
                case 'ArrowLeft':
                    if (orientation !== 'vertical') {
                        e.preventDefault();
                        newIndex = wrap ? (activeIndex - 1 + length) % length : Math.max(activeIndex - 1, 0);
                    }
                    break;
                case 'Home':
                    e.preventDefault();
                    newIndex = 0;
                    break;
                case 'End':
                    e.preventDefault();
                    newIndex = length - 1;
                    break;
                case 'Enter':
                case ' ':
                    e.preventDefault();
                    onSelect?.(items[activeIndex]);
                    return;
                default:
                    return;
            }
            setActiveIndex(newIndex);
            items[newIndex]?.focus();
        }
    }["useKeyboardNavigation.useCallback[handleKeyDown]"], [
        items,
        activeIndex,
        orientation,
        wrap,
        onSelect
    ]);
    return {
        activeIndex,
        setActiveIndex,
        handleKeyDown
    };
}
_s2(useKeyboardNavigation, "3g62zsnfN2YwC28Hys31Ja/HgIc=");
function usePrefersReducedMotion() {
    _s3();
    const [prefersReducedMotion, setPrefersReducedMotion] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "usePrefersReducedMotion.useEffect": ()=>{
            const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
            setPrefersReducedMotion(mediaQuery.matches);
            const listener = {
                "usePrefersReducedMotion.useEffect.listener": (e)=>{
                    setPrefersReducedMotion(e.matches);
                }
            }["usePrefersReducedMotion.useEffect.listener"];
            mediaQuery.addEventListener('change', listener);
            return ({
                "usePrefersReducedMotion.useEffect": ()=>mediaQuery.removeEventListener('change', listener)
            })["usePrefersReducedMotion.useEffect"];
        }
    }["usePrefersReducedMotion.useEffect"], []);
    return prefersReducedMotion;
}
_s3(usePrefersReducedMotion, "c2o+PeDo1dLruq/wbnW+Z6a6rIY=");
var _c, _c1, _c2, _c3, _c4;
__turbopack_context__.k.register(_c, "SkipNavLink");
__turbopack_context__.k.register(_c1, "SkipNavContent");
__turbopack_context__.k.register(_c2, "FocusTrap");
__turbopack_context__.k.register(_c3, "VisuallyHidden");
__turbopack_context__.k.register(_c4, "LiveRegion");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=RiderProjects_SyriaHub_098fcc45._.js.map