(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/RiderProjects/SyriaHub/lib/utils.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "cn",
    ()=>cn
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$clsx$2f$dist$2f$clsx$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/RiderProjects/SyriaHub/node_modules/clsx/dist/clsx.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$tailwind$2d$merge$2f$dist$2f$bundle$2d$mjs$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/RiderProjects/SyriaHub/node_modules/tailwind-merge/dist/bundle-mjs.mjs [app-client] (ecmascript)");
;
;
function cn(...inputs) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$tailwind$2d$merge$2f$dist$2f$bundle$2d$mjs$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["twMerge"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$clsx$2f$dist$2f$clsx$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["clsx"])(inputs));
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
]);

//# sourceMappingURL=RiderProjects_SyriaHub_8cce521e._.js.map