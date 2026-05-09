(globalThis["TURBOPACK"] || (globalThis["TURBOPACK"] = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[turbopack]/browser/dev/hmr-client/hmr-client.ts [client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/// <reference path="../../../shared/runtime/runtime-types.d.ts" />
/// <reference path="../../../shared/runtime/dev-globals.d.ts" />
/// <reference path="../../../shared/runtime/dev-protocol.d.ts" />
/// <reference path="../../../shared/runtime/dev-extensions.ts" />
__turbopack_context__.s([
    "connect",
    ()=>connect,
    "setHooks",
    ()=>setHooks,
    "subscribeToUpdate",
    ()=>subscribeToUpdate
]);
function connect({ addMessageListener, sendMessage, onUpdateError = console.error }) {
    addMessageListener((msg)=>{
        switch(msg.type){
            case 'turbopack-connected':
                handleSocketConnected(sendMessage);
                break;
            default:
                try {
                    if (Array.isArray(msg.data)) {
                        for(let i = 0; i < msg.data.length; i++){
                            handleSocketMessage(msg.data[i]);
                        }
                    } else {
                        handleSocketMessage(msg.data);
                    }
                    applyAggregatedUpdates();
                } catch (e) {
                    console.warn('[Fast Refresh] performing full reload\n\n' + "Fast Refresh will perform a full reload when you edit a file that's imported by modules outside of the React rendering tree.\n" + 'You might have a file which exports a React component but also exports a value that is imported by a non-React component file.\n' + 'Consider migrating the non-React component export to a separate file and importing it into both files.\n\n' + 'It is also possible the parent component of the component you edited is a class component, which disables Fast Refresh.\n' + 'Fast Refresh requires at least one parent function component in your React tree.');
                    onUpdateError(e);
                    location.reload();
                }
                break;
        }
    });
    const queued = globalThis.TURBOPACK_CHUNK_UPDATE_LISTENERS;
    if (queued != null && !Array.isArray(queued)) {
        throw new Error('A separate HMR handler was already registered');
    }
    globalThis.TURBOPACK_CHUNK_UPDATE_LISTENERS = {
        push: ([chunkPath, callback])=>{
            subscribeToChunkUpdate(chunkPath, sendMessage, callback);
        }
    };
    if (Array.isArray(queued)) {
        for (const [chunkPath, callback] of queued){
            subscribeToChunkUpdate(chunkPath, sendMessage, callback);
        }
    }
}
const updateCallbackSets = new Map();
function sendJSON(sendMessage, message) {
    sendMessage(JSON.stringify(message));
}
function resourceKey(resource) {
    return JSON.stringify({
        path: resource.path,
        headers: resource.headers || null
    });
}
function subscribeToUpdates(sendMessage, resource) {
    sendJSON(sendMessage, {
        type: 'turbopack-subscribe',
        ...resource
    });
    return ()=>{
        sendJSON(sendMessage, {
            type: 'turbopack-unsubscribe',
            ...resource
        });
    };
}
function handleSocketConnected(sendMessage) {
    for (const key of updateCallbackSets.keys()){
        subscribeToUpdates(sendMessage, JSON.parse(key));
    }
}
// we aggregate all pending updates until the issues are resolved
const chunkListsWithPendingUpdates = new Map();
function aggregateUpdates(msg) {
    const key = resourceKey(msg.resource);
    let aggregated = chunkListsWithPendingUpdates.get(key);
    if (aggregated) {
        aggregated.instruction = mergeChunkListUpdates(aggregated.instruction, msg.instruction);
    } else {
        chunkListsWithPendingUpdates.set(key, msg);
    }
}
function applyAggregatedUpdates() {
    if (chunkListsWithPendingUpdates.size === 0) return;
    hooks.beforeRefresh();
    for (const msg of chunkListsWithPendingUpdates.values()){
        triggerUpdate(msg);
    }
    chunkListsWithPendingUpdates.clear();
    finalizeUpdate();
}
function mergeChunkListUpdates(updateA, updateB) {
    let chunks;
    if (updateA.chunks != null) {
        if (updateB.chunks == null) {
            chunks = updateA.chunks;
        } else {
            chunks = mergeChunkListChunks(updateA.chunks, updateB.chunks);
        }
    } else if (updateB.chunks != null) {
        chunks = updateB.chunks;
    }
    let merged;
    if (updateA.merged != null) {
        if (updateB.merged == null) {
            merged = updateA.merged;
        } else {
            // Since `merged` is an array of updates, we need to merge them all into
            // one, consistent update.
            // Since there can only be `EcmascriptMergeUpdates` in the array, there is
            // no need to key on the `type` field.
            let update = updateA.merged[0];
            for(let i = 1; i < updateA.merged.length; i++){
                update = mergeChunkListEcmascriptMergedUpdates(update, updateA.merged[i]);
            }
            for(let i = 0; i < updateB.merged.length; i++){
                update = mergeChunkListEcmascriptMergedUpdates(update, updateB.merged[i]);
            }
            merged = [
                update
            ];
        }
    } else if (updateB.merged != null) {
        merged = updateB.merged;
    }
    return {
        type: 'ChunkListUpdate',
        chunks,
        merged
    };
}
function mergeChunkListChunks(chunksA, chunksB) {
    const chunks = {};
    for (const [chunkPath, chunkUpdateA] of Object.entries(chunksA)){
        const chunkUpdateB = chunksB[chunkPath];
        if (chunkUpdateB != null) {
            const mergedUpdate = mergeChunkUpdates(chunkUpdateA, chunkUpdateB);
            if (mergedUpdate != null) {
                chunks[chunkPath] = mergedUpdate;
            }
        } else {
            chunks[chunkPath] = chunkUpdateA;
        }
    }
    for (const [chunkPath, chunkUpdateB] of Object.entries(chunksB)){
        if (chunks[chunkPath] == null) {
            chunks[chunkPath] = chunkUpdateB;
        }
    }
    return chunks;
}
function mergeChunkUpdates(updateA, updateB) {
    if (updateA.type === 'added' && updateB.type === 'deleted' || updateA.type === 'deleted' && updateB.type === 'added') {
        return undefined;
    }
    if (updateB.type === 'total') {
        // A total update replaces the entire chunk, so it supersedes any prior update.
        return updateB;
    }
    if (updateA.type === 'partial') {
        invariant(updateA.instruction, 'Partial updates are unsupported');
    }
    if (updateB.type === 'partial') {
        invariant(updateB.instruction, 'Partial updates are unsupported');
    }
    return undefined;
}
function mergeChunkListEcmascriptMergedUpdates(mergedA, mergedB) {
    const entries = mergeEcmascriptChunkEntries(mergedA.entries, mergedB.entries);
    const chunks = mergeEcmascriptChunksUpdates(mergedA.chunks, mergedB.chunks);
    return {
        type: 'EcmascriptMergedUpdate',
        entries,
        chunks
    };
}
function mergeEcmascriptChunkEntries(entriesA, entriesB) {
    return {
        ...entriesA,
        ...entriesB
    };
}
function mergeEcmascriptChunksUpdates(chunksA, chunksB) {
    if (chunksA == null) {
        return chunksB;
    }
    if (chunksB == null) {
        return chunksA;
    }
    const chunks = {};
    for (const [chunkPath, chunkUpdateA] of Object.entries(chunksA)){
        const chunkUpdateB = chunksB[chunkPath];
        if (chunkUpdateB != null) {
            const mergedUpdate = mergeEcmascriptChunkUpdates(chunkUpdateA, chunkUpdateB);
            if (mergedUpdate != null) {
                chunks[chunkPath] = mergedUpdate;
            }
        } else {
            chunks[chunkPath] = chunkUpdateA;
        }
    }
    for (const [chunkPath, chunkUpdateB] of Object.entries(chunksB)){
        if (chunks[chunkPath] == null) {
            chunks[chunkPath] = chunkUpdateB;
        }
    }
    if (Object.keys(chunks).length === 0) {
        return undefined;
    }
    return chunks;
}
function mergeEcmascriptChunkUpdates(updateA, updateB) {
    if (updateA.type === 'added' && updateB.type === 'deleted') {
        // These two completely cancel each other out.
        return undefined;
    }
    if (updateA.type === 'deleted' && updateB.type === 'added') {
        const added = [];
        const deleted = [];
        const deletedModules = new Set(updateA.modules ?? []);
        const addedModules = new Set(updateB.modules ?? []);
        for (const moduleId of addedModules){
            if (!deletedModules.has(moduleId)) {
                added.push(moduleId);
            }
        }
        for (const moduleId of deletedModules){
            if (!addedModules.has(moduleId)) {
                deleted.push(moduleId);
            }
        }
        if (added.length === 0 && deleted.length === 0) {
            return undefined;
        }
        return {
            type: 'partial',
            added,
            deleted
        };
    }
    if (updateA.type === 'partial' && updateB.type === 'partial') {
        const added = new Set([
            ...updateA.added ?? [],
            ...updateB.added ?? []
        ]);
        const deleted = new Set([
            ...updateA.deleted ?? [],
            ...updateB.deleted ?? []
        ]);
        if (updateB.added != null) {
            for (const moduleId of updateB.added){
                deleted.delete(moduleId);
            }
        }
        if (updateB.deleted != null) {
            for (const moduleId of updateB.deleted){
                added.delete(moduleId);
            }
        }
        return {
            type: 'partial',
            added: [
                ...added
            ],
            deleted: [
                ...deleted
            ]
        };
    }
    if (updateA.type === 'added' && updateB.type === 'partial') {
        const modules = new Set([
            ...updateA.modules ?? [],
            ...updateB.added ?? []
        ]);
        for (const moduleId of updateB.deleted ?? []){
            modules.delete(moduleId);
        }
        return {
            type: 'added',
            modules: [
                ...modules
            ]
        };
    }
    if (updateA.type === 'partial' && updateB.type === 'deleted') {
        // We could eagerly return `updateB` here, but this would potentially be
        // incorrect if `updateA` has added modules.
        const modules = new Set(updateB.modules ?? []);
        if (updateA.added != null) {
            for (const moduleId of updateA.added){
                modules.delete(moduleId);
            }
        }
        return {
            type: 'deleted',
            modules: [
                ...modules
            ]
        };
    }
    // Any other update combination is invalid.
    return undefined;
}
function invariant(_, message) {
    throw new Error(`Invariant: ${message}`);
}
const CRITICAL = [
    'bug',
    'error',
    'fatal'
];
function compareByList(list, a, b) {
    const aI = list.indexOf(a) + 1 || list.length;
    const bI = list.indexOf(b) + 1 || list.length;
    return aI - bI;
}
const chunksWithIssues = new Map();
function emitIssues() {
    const issues = [];
    const deduplicationSet = new Set();
    for (const [_, chunkIssues] of chunksWithIssues){
        for (const chunkIssue of chunkIssues){
            if (deduplicationSet.has(chunkIssue.formatted)) continue;
            issues.push(chunkIssue);
            deduplicationSet.add(chunkIssue.formatted);
        }
    }
    sortIssues(issues);
    hooks.issues(issues);
}
function handleIssues(msg) {
    const key = resourceKey(msg.resource);
    let hasCriticalIssues = false;
    for (const issue of msg.issues){
        if (CRITICAL.includes(issue.severity)) {
            hasCriticalIssues = true;
        }
    }
    if (msg.issues.length > 0) {
        chunksWithIssues.set(key, msg.issues);
    } else if (chunksWithIssues.has(key)) {
        chunksWithIssues.delete(key);
    }
    emitIssues();
    return hasCriticalIssues;
}
const SEVERITY_ORDER = [
    'bug',
    'fatal',
    'error',
    'warning',
    'info',
    'log'
];
const CATEGORY_ORDER = [
    'parse',
    'resolve',
    'code generation',
    'rendering',
    'typescript',
    'other'
];
function sortIssues(issues) {
    issues.sort((a, b)=>{
        const first = compareByList(SEVERITY_ORDER, a.severity, b.severity);
        if (first !== 0) return first;
        return compareByList(CATEGORY_ORDER, a.category, b.category);
    });
}
const hooks = {
    beforeRefresh: ()=>{},
    refresh: ()=>{},
    buildOk: ()=>{},
    issues: (_issues)=>{}
};
function setHooks(newHooks) {
    Object.assign(hooks, newHooks);
}
function handleSocketMessage(msg) {
    sortIssues(msg.issues);
    handleIssues(msg);
    switch(msg.type){
        case 'issues':
            break;
        case 'partial':
            // aggregate updates
            aggregateUpdates(msg);
            break;
        default:
            // run single update
            const runHooks = chunkListsWithPendingUpdates.size === 0;
            if (runHooks) hooks.beforeRefresh();
            triggerUpdate(msg);
            if (runHooks) finalizeUpdate();
            break;
    }
}
function finalizeUpdate() {
    hooks.refresh();
    hooks.buildOk();
    // This is used by the Next.js integration test suite to notify it when HMR
    // updates have been completed.
    // TODO: Only run this in test environments (gate by `process.env.__NEXT_TEST_MODE`)
    if (globalThis.__NEXT_HMR_CB) {
        globalThis.__NEXT_HMR_CB();
        globalThis.__NEXT_HMR_CB = null;
    }
}
function subscribeToChunkUpdate(chunkListPath, sendMessage, callback) {
    return subscribeToUpdate({
        path: chunkListPath
    }, sendMessage, callback);
}
function subscribeToUpdate(resource, sendMessage, callback) {
    const key = resourceKey(resource);
    let callbackSet;
    const existingCallbackSet = updateCallbackSets.get(key);
    if (!existingCallbackSet) {
        callbackSet = {
            callbacks: new Set([
                callback
            ]),
            unsubscribe: subscribeToUpdates(sendMessage, resource)
        };
        updateCallbackSets.set(key, callbackSet);
    } else {
        existingCallbackSet.callbacks.add(callback);
        callbackSet = existingCallbackSet;
    }
    return ()=>{
        callbackSet.callbacks.delete(callback);
        if (callbackSet.callbacks.size === 0) {
            callbackSet.unsubscribe();
            updateCallbackSets.delete(key);
        }
    };
}
function triggerUpdate(msg) {
    const key = resourceKey(msg.resource);
    const callbackSet = updateCallbackSets.get(key);
    if (!callbackSet) {
        return;
    }
    for (const callback of callbackSet.callbacks){
        callback(msg);
    }
    if (msg.type === 'notFound') {
        // This indicates that the resource which we subscribed to either does not exist or
        // has been deleted. In either case, we should clear all update callbacks, so if a
        // new subscription is created for the same resource, it will send a new "subscribe"
        // message to the server.
        // No need to send an "unsubscribe" message to the server, it will have already
        // dropped the update stream before sending the "notFound" message.
        updateCallbackSets.delete(key);
    }
}
}),
"[project]/components/ui/Button.tsx [client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Button",
    ()=>Button
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react/jsx-dev-runtime.js [client] (ecmascript)");
;
const Button = ({ variant = 'primary', size = 'md', isLoading = false, fullWidth = false, className = '', children, disabled, ...props })=>{
    const baseClasses = 'inline-flex items-center justify-center font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed';
    const variantClasses = {
        primary: 'bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500 dark:bg-blue-500 dark:hover:bg-blue-600',
        secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-900 focus:ring-gray-500 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-100',
        danger: 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500 dark:bg-red-500 dark:hover:bg-red-600'
    };
    const sizeClasses = {
        sm: 'px-3 py-1.5 text-sm',
        md: 'px-4 py-2 text-sm',
        lg: 'px-6 py-3 text-base'
    };
    const widthClass = fullWidth ? 'w-full' : '';
    const buttonClasses = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${widthClass} ${className}`;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
        className: buttonClasses,
        disabled: disabled || isLoading,
        ...props,
        children: [
            isLoading && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                className: "animate-spin -ml-1 mr-2 h-4 w-4",
                xmlns: "http://www.w3.org/2000/svg",
                fill: "none",
                viewBox: "0 0 24 24",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("circle", {
                        className: "opacity-25",
                        cx: "12",
                        cy: "12",
                        r: "10",
                        stroke: "currentColor",
                        strokeWidth: "4"
                    }, void 0, false, {
                        fileName: "[project]/components/ui/Button.tsx",
                        lineNumber: 51,
                        columnNumber: 11
                    }, ("TURBOPACK compile-time value", void 0)),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                        className: "opacity-75",
                        fill: "currentColor",
                        d: "M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    }, void 0, false, {
                        fileName: "[project]/components/ui/Button.tsx",
                        lineNumber: 59,
                        columnNumber: 11
                    }, ("TURBOPACK compile-time value", void 0))
                ]
            }, void 0, true, {
                fileName: "[project]/components/ui/Button.tsx",
                lineNumber: 45,
                columnNumber: 9
            }, ("TURBOPACK compile-time value", void 0)),
            children
        ]
    }, void 0, true, {
        fileName: "[project]/components/ui/Button.tsx",
        lineNumber: 39,
        columnNumber: 5
    }, ("TURBOPACK compile-time value", void 0));
};
_c = Button;
var _c;
__turbopack_context__.k.register(_c, "Button");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/lib/auth.tsx [client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "AuthProvider",
    ()=>AuthProvider,
    "useAuth",
    ()=>useAuth
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/node_modules/next/dist/build/polyfills/process.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react/jsx-dev-runtime.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react/index.js [client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature();
;
const AuthContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["createContext"])(undefined);
const useAuth = ()=>{
    _s();
    const context = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useContext"])(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
_s(useAuth, "b9L3QQ+jgeyIrH0NfHrJ8nn7VMU=");
const AuthProvider = ({ children })=>{
    _s1();
    const [user, setUser] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [token, setToken] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [isLoading, setIsLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [isInitializing, setIsInitializing] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])(true); // 🆕 Estado de inicialización
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])(null);
    // Determinar la URL del API según el entorno
    const getApiUrl = ()=>{
        // Solo ejecutar en el cliente
        if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
        ;
        const hostname = window.location.hostname;
        const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1';
        const isProduction = hostname === 'eventoscordoba.xyz';
        console.log('🌐 Auth - Hostname detectado:', hostname);
        console.log('🏠 Auth - Es localhost:', isLocalhost);
        console.log('🏭 Auth - Es producción:', isProduction);
        // En desarrollo (localhost)
        if (isLocalhost) {
            // Priorizar localhost:3001 para desarrollo
            return 'http://localhost:3001';
        }
        // En producción (eventoscordoba.xyz) - usar URL conocida
        if (isProduction) {
            return 'https://api.eventoscordoba.xyz';
        }
        // En producción - usar la URL configurada
        if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
        ;
        // Fallback: asumir que el backend está en el mismo dominio
        return '';
    };
    // Verificar token al cargar la aplicación
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "AuthProvider.useEffect": ()=>{
            const savedToken = localStorage.getItem('auth_token');
            console.log('🔍 DEBUG Auth - Verificando token al cargar app');
            console.log('🔍 DEBUG Auth - Token en localStorage:', savedToken ? `${savedToken.substring(0, 20)}...` : 'null');
            if (savedToken) {
                console.log('🔍 DEBUG Auth - Token encontrado, verificando con backend...');
                verifyToken(savedToken);
            } else {
                console.log('🔍 DEBUG Auth - No hay token guardado, inicialización completa');
                setIsInitializing(false); // 🆕 Si no hay token, inicialización completa
            }
        }
    }["AuthProvider.useEffect"], []);
    const verifyToken = async (tokenToVerify)=>{
        try {
            const apiUrl = getApiUrl();
            console.log('🔍 DEBUG Auth - Verificando token con backend...');
            const response = await fetch(`${apiUrl}/api/auth/verify`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    token: tokenToVerify
                })
            });
            const data = await response.json();
            console.log('🔍 DEBUG Auth - Respuesta de verificación:', data);
            if (data.success) {
                console.log('🔍 DEBUG Auth - Token válido, restaurando sesión');
                setToken(tokenToVerify);
                setUser(data.data.user);
            } else {
                console.log('🔍 DEBUG Auth - Token inválido, limpiando estado');
                localStorage.removeItem('auth_token');
                setToken(null); // 🆕 LIMPIAR ESTADO DEL CONTEXTO
                setUser(null); // 🆕 LIMPIAR ESTADO DEL CONTEXTO
            }
        } catch (error) {
            console.error('🔍 DEBUG Auth - Error verificando token:', error);
            console.log('🔍 DEBUG Auth - Token inválido por error, limpiando estado');
            localStorage.removeItem('auth_token');
            setToken(null); // 🆕 LIMPIAR ESTADO DEL CONTEXTO
            setUser(null); // 🆕 LIMPIAR ESTADO DEL CONTEXTO
        } finally{
            setIsInitializing(false); // 🆕 INICIALIZACIÓN COMPLETA
            console.log('🔍 DEBUG Auth - Inicialización de auth completada');
        }
    };
    const login = async (email, password)=>{
        setIsLoading(true);
        setError(null);
        try {
            const apiUrl = getApiUrl();
            console.log('🔍 DEBUG Auth - Intentando login para:', email);
            console.log('🔍 DEBUG Auth - API URL:', apiUrl);
            const response = await fetch(`${apiUrl}/api/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email,
                    password
                })
            });
            const data = await response.json();
            console.log('🔍 DEBUG Auth - Respuesta del login:', data);
            if (!response.ok) {
                console.log('🔍 DEBUG Auth - Login fallido, status:', response.status);
                throw new Error(data.error || 'Error al iniciar sesión');
            }
            if (data.success) {
                const { token: newToken, user: userData } = data.data;
                console.log('🔍 DEBUG Auth - Login exitoso, guardando token:', newToken ? `${newToken.substring(0, 20)}...` : 'null');
                console.log('🔍 DEBUG Auth - Usuario autenticado:', userData);
                setToken(newToken);
                setUser(userData);
                localStorage.setItem('auth_token', newToken);
                console.log('🔍 DEBUG Auth - Token guardado en localStorage');
            } else {
                console.log('🔍 DEBUG Auth - Respuesta sin success');
                throw new Error(data.error || 'Error al iniciar sesión');
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
            console.log('🔍 DEBUG Auth - Error en login:', errorMessage);
            setError(errorMessage);
            throw error;
        } finally{
            setIsLoading(false);
        }
    };
    const register = async (email, password, name)=>{
        setIsLoading(true);
        setError(null);
        try {
            const apiUrl = getApiUrl();
            const response = await fetch(`${apiUrl}/api/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email,
                    password,
                    name
                })
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error || 'Error al registrarse');
            }
            if (data.success) {
                const { token: newToken, user: userData } = data.data;
                setToken(newToken);
                setUser(userData);
                localStorage.setItem('auth_token', newToken);
            } else {
                throw new Error(data.error || 'Error al registrarse');
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
            setError(errorMessage);
            throw error;
        } finally{
            setIsLoading(false);
        }
    };
    const logout = ()=>{
        setUser(null);
        setToken(null);
        localStorage.removeItem('auth_token');
        setError(null);
    };
    const value = {
        user,
        token,
        login,
        register,
        logout,
        isLoading,
        isInitializing,
        error
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(AuthContext.Provider, {
        value: value,
        children: children
    }, void 0, false, {
        fileName: "[project]/lib/auth.tsx",
        lineNumber: 233,
        columnNumber: 10
    }, ("TURBOPACK compile-time value", void 0));
};
_s1(AuthProvider, "P7Fn4DVUg7dP5dzhhbInhv0dH/k=");
_c = AuthProvider;
var _c;
__turbopack_context__.k.register(_c, "AuthProvider");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/UserMenu.tsx [client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "UserMenu",
    ()=>UserMenu
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react/jsx-dev-runtime.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react/index.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$link$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/link.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$auth$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/auth.tsx [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$router$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/router.js [client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
;
;
;
;
const UserMenu = ()=>{
    _s();
    const { user, logout } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$auth$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["useAuth"])();
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$router$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useRouter"])();
    const [isOpen, setIsOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const menuRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "UserMenu.useEffect": ()=>{
            const handleClickOutside = {
                "UserMenu.useEffect.handleClickOutside": (event)=>{
                    if (menuRef.current && !menuRef.current.contains(event.target)) {
                        setIsOpen(false);
                    }
                }
            }["UserMenu.useEffect.handleClickOutside"];
            document.addEventListener('mousedown', handleClickOutside);
            return ({
                "UserMenu.useEffect": ()=>document.removeEventListener('mousedown', handleClickOutside)
            })["UserMenu.useEffect"];
        }
    }["UserMenu.useEffect"], []);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "UserMenu.useEffect": ()=>{
            setIsOpen(false);
        }
    }["UserMenu.useEffect"], [
        router.pathname
    ]);
    const handleLogout = async ()=>{
        logout();
        router.push('/');
    };
    const getInitials = (name)=>{
        return name.split(' ').map((word)=>word.charAt(0)).join('').toUpperCase().slice(0, 2);
    };
    const getAvatarContent = ()=>{
        if (user?.avatar) {
            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                src: user.avatar,
                alt: user.name || 'Usuario',
                className: "w-8 h-8 rounded-full object-cover"
            }, void 0, false, {
                fileName: "[project]/components/UserMenu.tsx",
                lineNumber: 44,
                columnNumber: 9
            }, ("TURBOPACK compile-time value", void 0));
        }
        if (user?.name) {
            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 dark:from-blue-400 dark:to-purple-500 rounded-full flex items-center justify-center text-white font-semibold text-sm",
                children: getInitials(user.name)
            }, void 0, false, {
                fileName: "[project]/components/UserMenu.tsx",
                lineNumber: 53,
                columnNumber: 9
            }, ("TURBOPACK compile-time value", void 0));
        }
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                className: "w-5 h-5 text-gray-600 dark:text-gray-300",
                fill: "currentColor",
                viewBox: "0 0 20 20",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                    fillRule: "evenodd",
                    d: "M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z",
                    clipRule: "evenodd"
                }, void 0, false, {
                    fileName: "[project]/components/UserMenu.tsx",
                    lineNumber: 61,
                    columnNumber: 11
                }, ("TURBOPACK compile-time value", void 0))
            }, void 0, false, {
                fileName: "[project]/components/UserMenu.tsx",
                lineNumber: 60,
                columnNumber: 9
            }, ("TURBOPACK compile-time value", void 0))
        }, void 0, false, {
            fileName: "[project]/components/UserMenu.tsx",
            lineNumber: 59,
            columnNumber: 7
        }, ("TURBOPACK compile-time value", void 0));
    };
    if (!user) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "flex items-center space-x-4",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$link$2e$js__$5b$client$5d$__$28$ecmascript$29$__["default"], {
                    href: "/login",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        className: "text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors",
                        children: "Iniciar sesión"
                    }, void 0, false, {
                        fileName: "[project]/components/UserMenu.tsx",
                        lineNumber: 71,
                        columnNumber: 11
                    }, ("TURBOPACK compile-time value", void 0))
                }, void 0, false, {
                    fileName: "[project]/components/UserMenu.tsx",
                    lineNumber: 70,
                    columnNumber: 9
                }, ("TURBOPACK compile-time value", void 0)),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$link$2e$js__$5b$client$5d$__$28$ecmascript$29$__["default"], {
                    href: "/register",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        className: "bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors",
                        children: "Registrarse"
                    }, void 0, false, {
                        fileName: "[project]/components/UserMenu.tsx",
                        lineNumber: 76,
                        columnNumber: 11
                    }, ("TURBOPACK compile-time value", void 0))
                }, void 0, false, {
                    fileName: "[project]/components/UserMenu.tsx",
                    lineNumber: 75,
                    columnNumber: 9
                }, ("TURBOPACK compile-time value", void 0))
            ]
        }, void 0, true, {
            fileName: "[project]/components/UserMenu.tsx",
            lineNumber: 69,
            columnNumber: 7
        }, ("TURBOPACK compile-time value", void 0));
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "relative",
        ref: menuRef,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                onClick: ()=>setIsOpen(!isOpen),
                className: "flex items-center space-x-2 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900",
                "aria-expanded": isOpen,
                "aria-haspopup": "true",
                children: [
                    getAvatarContent(),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                        className: `w-4 h-4 text-gray-600 dark:text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`,
                        fill: "none",
                        stroke: "currentColor",
                        viewBox: "0 0 24 24",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                            strokeLinecap: "round",
                            strokeLinejoin: "round",
                            strokeWidth: 2,
                            d: "M19 9l-7 7-7-7"
                        }, void 0, false, {
                            fileName: "[project]/components/UserMenu.tsx",
                            lineNumber: 99,
                            columnNumber: 11
                        }, ("TURBOPACK compile-time value", void 0))
                    }, void 0, false, {
                        fileName: "[project]/components/UserMenu.tsx",
                        lineNumber: 93,
                        columnNumber: 9
                    }, ("TURBOPACK compile-time value", void 0))
                ]
            }, void 0, true, {
                fileName: "[project]/components/UserMenu.tsx",
                lineNumber: 86,
                columnNumber: 7
            }, ("TURBOPACK compile-time value", void 0)),
            isOpen && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-50",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "px-4 py-3 border-b border-gray-200 dark:border-gray-700",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex items-center space-x-3",
                            children: [
                                getAvatarContent(),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex-1 min-w-0",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "text-sm font-medium text-gray-900 dark:text-gray-100 truncate",
                                            children: user.name
                                        }, void 0, false, {
                                            fileName: "[project]/components/UserMenu.tsx",
                                            lineNumber: 109,
                                            columnNumber: 17
                                        }, ("TURBOPACK compile-time value", void 0)),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "text-xs text-gray-500 dark:text-gray-400 truncate",
                                            children: user.email
                                        }, void 0, false, {
                                            fileName: "[project]/components/UserMenu.tsx",
                                            lineNumber: 112,
                                            columnNumber: 17
                                        }, ("TURBOPACK compile-time value", void 0))
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/UserMenu.tsx",
                                    lineNumber: 108,
                                    columnNumber: 15
                                }, ("TURBOPACK compile-time value", void 0))
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/UserMenu.tsx",
                            lineNumber: 106,
                            columnNumber: 13
                        }, ("TURBOPACK compile-time value", void 0))
                    }, void 0, false, {
                        fileName: "[project]/components/UserMenu.tsx",
                        lineNumber: 105,
                        columnNumber: 11
                    }, ("TURBOPACK compile-time value", void 0)),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "py-2",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$link$2e$js__$5b$client$5d$__$28$ecmascript$29$__["default"], {
                                href: `/profile/${user.id}`,
                                className: "flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white transition-colors",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                        className: "w-4 h-4 mr-3",
                                        fill: "none",
                                        stroke: "currentColor",
                                        viewBox: "0 0 24 24",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                            strokeLinecap: "round",
                                            strokeLinejoin: "round",
                                            strokeWidth: 2,
                                            d: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                        }, void 0, false, {
                                            fileName: "[project]/components/UserMenu.tsx",
                                            lineNumber: 125,
                                            columnNumber: 17
                                        }, ("TURBOPACK compile-time value", void 0))
                                    }, void 0, false, {
                                        fileName: "[project]/components/UserMenu.tsx",
                                        lineNumber: 124,
                                        columnNumber: 15
                                    }, ("TURBOPACK compile-time value", void 0)),
                                    "Ver perfil"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/UserMenu.tsx",
                                lineNumber: 120,
                                columnNumber: 13
                            }, ("TURBOPACK compile-time value", void 0)),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$link$2e$js__$5b$client$5d$__$28$ecmascript$29$__["default"], {
                                href: "/profile/edit",
                                className: "flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white transition-colors",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                        className: "w-4 h-4 mr-3",
                                        fill: "none",
                                        stroke: "currentColor",
                                        viewBox: "0 0 24 24",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                            strokeLinecap: "round",
                                            strokeLinejoin: "round",
                                            strokeWidth: 2,
                                            d: "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                        }, void 0, false, {
                                            fileName: "[project]/components/UserMenu.tsx",
                                            lineNumber: 135,
                                            columnNumber: 17
                                        }, ("TURBOPACK compile-time value", void 0))
                                    }, void 0, false, {
                                        fileName: "[project]/components/UserMenu.tsx",
                                        lineNumber: 134,
                                        columnNumber: 15
                                    }, ("TURBOPACK compile-time value", void 0)),
                                    "Editar perfil"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/UserMenu.tsx",
                                lineNumber: 130,
                                columnNumber: 13
                            }, ("TURBOPACK compile-time value", void 0)),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$link$2e$js__$5b$client$5d$__$28$ecmascript$29$__["default"], {
                                href: "/events/create",
                                className: "flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white transition-colors",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                        className: "w-4 h-4 mr-3",
                                        fill: "none",
                                        stroke: "currentColor",
                                        viewBox: "0 0 24 24",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                            strokeLinecap: "round",
                                            strokeLinejoin: "round",
                                            strokeWidth: 2,
                                            d: "M12 6v6m0 0v6m0-6h6m-6 0H6"
                                        }, void 0, false, {
                                            fileName: "[project]/components/UserMenu.tsx",
                                            lineNumber: 145,
                                            columnNumber: 17
                                        }, ("TURBOPACK compile-time value", void 0))
                                    }, void 0, false, {
                                        fileName: "[project]/components/UserMenu.tsx",
                                        lineNumber: 144,
                                        columnNumber: 15
                                    }, ("TURBOPACK compile-time value", void 0)),
                                    "Crear evento"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/UserMenu.tsx",
                                lineNumber: 140,
                                columnNumber: 13
                            }, ("TURBOPACK compile-time value", void 0)),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$link$2e$js__$5b$client$5d$__$28$ecmascript$29$__["default"], {
                                href: "/events/my-events",
                                className: "flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white transition-colors",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                        className: "w-4 h-4 mr-3",
                                        fill: "none",
                                        stroke: "currentColor",
                                        viewBox: "0 0 24 24",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                            strokeLinecap: "round",
                                            strokeLinejoin: "round",
                                            strokeWidth: 2,
                                            d: "M8 7V3a4 4 0 118 0v4m-4 8v4a4 4 0 01-8 0v-4m4-8v4m0 0v4a4 4 0 01-8 0v-4m4-8v4m8 0v4a4 4 0 01-8 0v-4"
                                        }, void 0, false, {
                                            fileName: "[project]/components/UserMenu.tsx",
                                            lineNumber: 155,
                                            columnNumber: 17
                                        }, ("TURBOPACK compile-time value", void 0))
                                    }, void 0, false, {
                                        fileName: "[project]/components/UserMenu.tsx",
                                        lineNumber: 154,
                                        columnNumber: 15
                                    }, ("TURBOPACK compile-time value", void 0)),
                                    "Mis eventos"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/UserMenu.tsx",
                                lineNumber: 150,
                                columnNumber: 13
                            }, ("TURBOPACK compile-time value", void 0)),
                            user.role === 'admin' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$link$2e$js__$5b$client$5d$__$28$ecmascript$29$__["default"], {
                                href: "/dashboard",
                                className: "flex items-center px-4 py-2 text-sm text-blue-600 dark:text-blue-400 font-medium hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                        className: "w-4 h-4 mr-3",
                                        fill: "none",
                                        stroke: "currentColor",
                                        viewBox: "0 0 24 24",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                            strokeLinecap: "round",
                                            strokeLinejoin: "round",
                                            strokeWidth: 2,
                                            d: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                                        }, void 0, false, {
                                            fileName: "[project]/components/UserMenu.tsx",
                                            lineNumber: 166,
                                            columnNumber: 19
                                        }, ("TURBOPACK compile-time value", void 0))
                                    }, void 0, false, {
                                        fileName: "[project]/components/UserMenu.tsx",
                                        lineNumber: 165,
                                        columnNumber: 17
                                    }, ("TURBOPACK compile-time value", void 0)),
                                    "Panel de Control"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/UserMenu.tsx",
                                lineNumber: 161,
                                columnNumber: 15
                            }, ("TURBOPACK compile-time value", void 0))
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/UserMenu.tsx",
                        lineNumber: 119,
                        columnNumber: 11
                    }, ("TURBOPACK compile-time value", void 0)),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "border-t border-gray-200 dark:border-gray-700 my-1"
                    }, void 0, false, {
                        fileName: "[project]/components/UserMenu.tsx",
                        lineNumber: 174,
                        columnNumber: 11
                    }, ("TURBOPACK compile-time value", void 0)),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: handleLogout,
                        className: "flex items-center w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 hover:text-red-700 dark:hover:text-red-300 transition-colors",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                className: "w-4 h-4 mr-3",
                                fill: "none",
                                stroke: "currentColor",
                                viewBox: "0 0 24 24",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                    strokeLinecap: "round",
                                    strokeLinejoin: "round",
                                    strokeWidth: 2,
                                    d: "M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                                }, void 0, false, {
                                    fileName: "[project]/components/UserMenu.tsx",
                                    lineNumber: 181,
                                    columnNumber: 15
                                }, ("TURBOPACK compile-time value", void 0))
                            }, void 0, false, {
                                fileName: "[project]/components/UserMenu.tsx",
                                lineNumber: 180,
                                columnNumber: 13
                            }, ("TURBOPACK compile-time value", void 0)),
                            "Cerrar sesión"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/UserMenu.tsx",
                        lineNumber: 176,
                        columnNumber: 11
                    }, ("TURBOPACK compile-time value", void 0))
                ]
            }, void 0, true, {
                fileName: "[project]/components/UserMenu.tsx",
                lineNumber: 104,
                columnNumber: 9
            }, ("TURBOPACK compile-time value", void 0))
        ]
    }, void 0, true, {
        fileName: "[project]/components/UserMenu.tsx",
        lineNumber: 85,
        columnNumber: 5
    }, ("TURBOPACK compile-time value", void 0));
};
_s(UserMenu, "gUrzMDOmxoQoshivGXe/6HuIFMg=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$auth$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["useAuth"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$router$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useRouter"]
    ];
});
_c = UserMenu;
var _c;
__turbopack_context__.k.register(_c, "UserMenu");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/lib/theme.tsx [client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ThemeProvider",
    ()=>ThemeProvider,
    "useTheme",
    ()=>useTheme
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react/jsx-dev-runtime.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react/index.js [client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature();
;
const ThemeContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["createContext"])(undefined);
const STORAGE_KEY = 'themePreference';
const VALID_THEMES = [
    'light',
    'dark',
    'system'
];
function getSystemTheme() {
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}
function resolveTheme(theme) {
    if (theme === 'system') return getSystemTheme();
    return theme;
}
function applyThemeToDOM(resolvedTheme) {
    const root = document.documentElement;
    if (resolvedTheme === 'dark') {
        root.classList.add('dark');
    } else {
        root.classList.remove('dark');
    }
}
function readStoredTheme() {
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored && VALID_THEMES.includes(stored)) {
            return stored;
        }
    } catch  {
    // localStorage unavailable (e.g. Safari private mode)
    }
    return 'system';
}
function ThemeProvider({ children }) {
    _s();
    const [theme, setThemeState] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])('system');
    const [mounted, setMounted] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])(false);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "ThemeProvider.useEffect": ()=>{
            setThemeState(readStoredTheme());
            setMounted(true);
        }
    }["ThemeProvider.useEffect"], []);
    const resolvedTheme = resolveTheme(theme);
    const setTheme = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "ThemeProvider.useCallback[setTheme]": (newTheme)=>{
            setThemeState(newTheme);
            try {
                localStorage.setItem(STORAGE_KEY, newTheme);
            } catch  {
            // localStorage unavailable
            }
        }
    }["ThemeProvider.useCallback[setTheme]"], []);
    const toggleTheme = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "ThemeProvider.useCallback[toggleTheme]": ()=>{
            setThemeState({
                "ThemeProvider.useCallback[toggleTheme]": (prev)=>{
                    const current = resolveTheme(prev);
                    const next = current === 'dark' ? 'light' : 'dark';
                    try {
                        localStorage.setItem(STORAGE_KEY, next);
                    } catch  {
                    // localStorage unavailable
                    }
                    return next;
                }
            }["ThemeProvider.useCallback[toggleTheme]"]);
        }
    }["ThemeProvider.useCallback[toggleTheme]"], []);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "ThemeProvider.useEffect": ()=>{
            if (!mounted) return;
            applyThemeToDOM(resolvedTheme);
        }
    }["ThemeProvider.useEffect"], [
        resolvedTheme,
        mounted
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "ThemeProvider.useEffect": ()=>{
            if (theme !== 'system') return;
            const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
            const handler = {
                "ThemeProvider.useEffect.handler": ()=>{
                    applyThemeToDOM(getSystemTheme());
                }
            }["ThemeProvider.useEffect.handler"];
            mediaQuery.addEventListener('change', handler);
            return ({
                "ThemeProvider.useEffect": ()=>mediaQuery.removeEventListener('change', handler)
            })["ThemeProvider.useEffect"];
        }
    }["ThemeProvider.useEffect"], [
        theme
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "ThemeProvider.useEffect": ()=>{
            const handler = {
                "ThemeProvider.useEffect.handler": (e)=>{
                    if (e.key !== STORAGE_KEY) return;
                    const newValue = e.newValue;
                    if (newValue && VALID_THEMES.includes(newValue)) {
                        setThemeState(newValue);
                    } else if (e.newValue === null) {
                        setThemeState('system');
                    }
                }
            }["ThemeProvider.useEffect.handler"];
            window.addEventListener('storage', handler);
            return ({
                "ThemeProvider.useEffect": ()=>window.removeEventListener('storage', handler)
            })["ThemeProvider.useEffect"];
        }
    }["ThemeProvider.useEffect"], []);
    if (!mounted) {
        return null;
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(ThemeContext.Provider, {
        value: {
            theme,
            resolvedTheme,
            setTheme,
            toggleTheme
        },
        children: children
    }, void 0, false, {
        fileName: "[project]/lib/theme.tsx",
        lineNumber: 119,
        columnNumber: 5
    }, this);
}
_s(ThemeProvider, "njUJnqiWq64EN2HZAXmdqhXslGM=");
_c = ThemeProvider;
function useTheme() {
    _s1();
    const context = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useContext"])(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
}
_s1(useTheme, "b9L3QQ+jgeyIrH0NfHrJ8nn7VMU=");
var _c;
__turbopack_context__.k.register(_c, "ThemeProvider");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/ui/ThemeToggle.tsx [client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ThemeToggle",
    ()=>ThemeToggle
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react/jsx-dev-runtime.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$theme$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/theme.tsx [client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
;
const ThemeToggle = ()=>{
    _s();
    const { resolvedTheme, toggleTheme } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$theme$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["useTheme"])();
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
        onClick: toggleTheme,
        type: "button",
        "aria-label": resolvedTheme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro',
        className: "relative inline-flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                className: `h-5 w-5 transition-transform ${resolvedTheme === 'dark' ? 'scale-100 rotate-0' : 'scale-0 rotate-90'}`,
                fill: "none",
                viewBox: "0 0 24 24",
                stroke: "currentColor",
                strokeWidth: 2,
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                    strokeLinecap: "round",
                    strokeLinejoin: "round",
                    d: "M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.757l-.707-.707m12.728 0l-.707.707M6.343 17.243l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                }, void 0, false, {
                    fileName: "[project]/components/ui/ThemeToggle.tsx",
                    lineNumber: 26,
                    columnNumber: 9
                }, ("TURBOPACK compile-time value", void 0))
            }, void 0, false, {
                fileName: "[project]/components/ui/ThemeToggle.tsx",
                lineNumber: 19,
                columnNumber: 7
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                className: `absolute h-5 w-5 transition-transform ${resolvedTheme === 'dark' ? 'scale-0 rotate-90' : 'scale-100 rotate-0'}`,
                fill: "none",
                viewBox: "0 0 24 24",
                stroke: "currentColor",
                strokeWidth: 2,
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                    strokeLinecap: "round",
                    strokeLinejoin: "round",
                    d: "M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                }, void 0, false, {
                    fileName: "[project]/components/ui/ThemeToggle.tsx",
                    lineNumber: 39,
                    columnNumber: 9
                }, ("TURBOPACK compile-time value", void 0))
            }, void 0, false, {
                fileName: "[project]/components/ui/ThemeToggle.tsx",
                lineNumber: 32,
                columnNumber: 7
            }, ("TURBOPACK compile-time value", void 0))
        ]
    }, void 0, true, {
        fileName: "[project]/components/ui/ThemeToggle.tsx",
        lineNumber: 8,
        columnNumber: 5
    }, ("TURBOPACK compile-time value", void 0));
};
_s(ThemeToggle, "DuMb+L6SXlrJ3nXbvpSk2jeISAU=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$theme$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["useTheme"]
    ];
});
_c = ThemeToggle;
var _c;
__turbopack_context__.k.register(_c, "ThemeToggle");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/lib/api.ts [client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ApiError",
    ()=>ApiError,
    "apiFetch",
    ()=>apiFetch
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/node_modules/next/dist/build/polyfills/process.js [client] (ecmascript)");
class ApiError extends Error {
    status;
    details;
    constructor(status, message, details){
        super(message);
        this.status = status;
        this.details = details;
    }
}
function getApiUrl() {
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    const hostname = window.location.hostname;
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
        return 'http://localhost:3001';
    }
    if (hostname === 'eventoscordoba.xyz') {
        return 'https://api.eventoscordoba.xyz';
    }
    return ("TURBOPACK compile-time value", "") || 'https://api.eventoscordoba.xyz';
}
async function apiFetch(path, options) {
    const apiUrl = getApiUrl();
    const headers = {
        'Content-Type': 'application/json',
        ...options?.headers
    };
    if (options?.token) {
        headers['Authorization'] = `Bearer ${options.token}`;
    }
    const response = await fetch(`${apiUrl}${path}`, {
        ...options,
        headers
    });
    if (!response.ok) {
        const errorBody = await response.json().catch(()=>({}));
        throw new ApiError(response.status, errorBody.error || 'Error de API', errorBody.details);
    }
    return response.json();
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/lib/queryClient.ts [client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "queryClient",
    ()=>queryClient
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$query$2d$core$2f$build$2f$modern$2f$queryClient$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@tanstack/query-core/build/modern/queryClient.js [client] (ecmascript)");
;
const queryClient = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$query$2d$core$2f$build$2f$modern$2f$queryClient$2e$js__$5b$client$5d$__$28$ecmascript$29$__["QueryClient"]({
    defaultOptions: {
        queries: {
            refetchOnWindowFocus: false,
            retry: 1,
            staleTime: 30_000,
            gcTime: 300_000
        }
    }
});
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/lib/queries/useNotifications.ts [client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "useDeleteNotification",
    ()=>useDeleteNotification,
    "useDeleteReadNotifications",
    ()=>useDeleteReadNotifications,
    "useMarkAllAsRead",
    ()=>useMarkAllAsRead,
    "useMarkAsRead",
    ()=>useMarkAsRead,
    "useNotifications",
    ()=>useNotifications,
    "useUnreadCount",
    ()=>useUnreadCount
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useQuery$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@tanstack/react-query/build/modern/useQuery.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useMutation$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@tanstack/react-query/build/modern/useMutation.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2e$ts__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/api.ts [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$queryClient$2e$ts__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/queryClient.ts [client] (ecmascript)");
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature(), _s2 = __turbopack_context__.k.signature(), _s3 = __turbopack_context__.k.signature(), _s4 = __turbopack_context__.k.signature(), _s5 = __turbopack_context__.k.signature();
;
;
;
function useUnreadCount(token) {
    _s();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useQuery$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useQuery"])({
        queryKey: [
            'notifications',
            'unread-count'
        ],
        queryFn: {
            "useUnreadCount.useQuery": ()=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["apiFetch"])('/api/notifications/unread-count', {
                    token: token || undefined
                })
        }["useUnreadCount.useQuery"],
        enabled: !!token,
        refetchInterval: 30_000,
        refetchIntervalInBackground: false,
        staleTime: 15_000
    });
}
_s(useUnreadCount, "4ZpngI1uv+Uo3WQHEZmTQ5FNM+k=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useQuery$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useQuery"]
    ];
});
function useNotifications(token, options) {
    _s1();
    const params = new URLSearchParams();
    if (options?.unreadOnly) params.set('unreadOnly', 'true');
    if (options?.page) params.set('page', String(options.page));
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useQuery$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useQuery"])({
        queryKey: [
            'notifications',
            'list',
            options
        ],
        queryFn: {
            "useNotifications.useQuery": ()=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["apiFetch"])(`/api/notifications?${params.toString()}`, {
                    token: token || undefined
                })
        }["useNotifications.useQuery"],
        enabled: !!token,
        staleTime: 15_000
    });
}
_s1(useNotifications, "4ZpngI1uv+Uo3WQHEZmTQ5FNM+k=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useQuery$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useQuery"]
    ];
});
function useMarkAsRead(token) {
    _s2();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useMutation$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useMutation"])({
        mutationFn: {
            "useMarkAsRead.useMutation": (id)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["apiFetch"])(`/api/notifications/${id}/read`, {
                    token: token || undefined,
                    method: 'PATCH'
                })
        }["useMarkAsRead.useMutation"],
        onSuccess: {
            "useMarkAsRead.useMutation": ()=>{
                __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$queryClient$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["queryClient"].invalidateQueries({
                    queryKey: [
                        'notifications'
                    ]
                });
            }
        }["useMarkAsRead.useMutation"]
    });
}
_s2(useMarkAsRead, "wwwtpB20p0aLiHIvSy5P98MwIUg=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useMutation$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useMutation"]
    ];
});
function useMarkAllAsRead(token) {
    _s3();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useMutation$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useMutation"])({
        mutationFn: {
            "useMarkAllAsRead.useMutation": ()=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["apiFetch"])('/api/notifications/mark-all-read', {
                    token: token || undefined,
                    method: 'PATCH'
                })
        }["useMarkAllAsRead.useMutation"],
        onSuccess: {
            "useMarkAllAsRead.useMutation": ()=>{
                __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$queryClient$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["queryClient"].invalidateQueries({
                    queryKey: [
                        'notifications'
                    ]
                });
            }
        }["useMarkAllAsRead.useMutation"]
    });
}
_s3(useMarkAllAsRead, "wwwtpB20p0aLiHIvSy5P98MwIUg=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useMutation$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useMutation"]
    ];
});
function useDeleteNotification(token) {
    _s4();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useMutation$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useMutation"])({
        mutationFn: {
            "useDeleteNotification.useMutation": (id)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["apiFetch"])(`/api/notifications/${id}`, {
                    token: token || undefined,
                    method: 'DELETE'
                })
        }["useDeleteNotification.useMutation"],
        onSuccess: {
            "useDeleteNotification.useMutation": ()=>{
                __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$queryClient$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["queryClient"].invalidateQueries({
                    queryKey: [
                        'notifications'
                    ]
                });
            }
        }["useDeleteNotification.useMutation"]
    });
}
_s4(useDeleteNotification, "wwwtpB20p0aLiHIvSy5P98MwIUg=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useMutation$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useMutation"]
    ];
});
function useDeleteReadNotifications(token) {
    _s5();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useMutation$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useMutation"])({
        mutationFn: {
            "useDeleteReadNotifications.useMutation": ()=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["apiFetch"])('/api/notifications/read-all', {
                    token: token || undefined,
                    method: 'DELETE'
                })
        }["useDeleteReadNotifications.useMutation"],
        onSuccess: {
            "useDeleteReadNotifications.useMutation": ()=>{
                __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$queryClient$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["queryClient"].invalidateQueries({
                    queryKey: [
                        'notifications'
                    ]
                });
            }
        }["useDeleteReadNotifications.useMutation"]
    });
}
_s5(useDeleteReadNotifications, "wwwtpB20p0aLiHIvSy5P98MwIUg=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useMutation$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useMutation"]
    ];
});
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/notifications/NotificationItem.tsx [client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "NotificationItem",
    ()=>NotificationItem
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react/jsx-dev-runtime.js [client] (ecmascript)");
;
function getRelativeTime(dateStr) {
    const now = new Date();
    const date = new Date(dateStr);
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    if (diffMins < 1) return 'Ahora';
    if (diffMins < 60) return `Hace ${diffMins} min`;
    if (diffHours < 24) return `Hace ${diffHours}h`;
    if (diffDays < 7) return `Hace ${diffDays}d`;
    return date.toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'short'
    });
}
const typeConfig = {
    EVENT_CANCELLED: {
        borderColor: 'border-l-red-500',
        iconColor: 'text-red-500',
        icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
            className: "w-5 h-5",
            fill: "none",
            viewBox: "0 0 24 24",
            stroke: "currentColor",
            strokeWidth: 2,
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                strokeLinecap: "round",
                strokeLinejoin: "round",
                d: "M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
            }, void 0, false, {
                fileName: "[project]/components/notifications/NotificationItem.tsx",
                lineNumber: 33,
                columnNumber: 9
            }, ("TURBOPACK compile-time value", void 0))
        }, void 0, false, {
            fileName: "[project]/components/notifications/NotificationItem.tsx",
            lineNumber: 32,
            columnNumber: 7
        }, ("TURBOPACK compile-time value", void 0))
    },
    EVENT_DATE_CHANGED: {
        borderColor: 'border-l-orange-400',
        iconColor: 'text-orange-400',
        icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
            className: "w-5 h-5",
            fill: "none",
            viewBox: "0 0 24 24",
            stroke: "currentColor",
            strokeWidth: 2,
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                strokeLinecap: "round",
                strokeLinejoin: "round",
                d: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            }, void 0, false, {
                fileName: "[project]/components/notifications/NotificationItem.tsx",
                lineNumber: 42,
                columnNumber: 9
            }, ("TURBOPACK compile-time value", void 0))
        }, void 0, false, {
            fileName: "[project]/components/notifications/NotificationItem.tsx",
            lineNumber: 41,
            columnNumber: 7
        }, ("TURBOPACK compile-time value", void 0))
    },
    EVENT_REMINDER: {
        borderColor: 'border-l-blue-500',
        iconColor: 'text-blue-500',
        icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
            className: "w-5 h-5",
            fill: "none",
            viewBox: "0 0 24 24",
            stroke: "currentColor",
            strokeWidth: 2,
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                strokeLinecap: "round",
                strokeLinejoin: "round",
                d: "M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
            }, void 0, false, {
                fileName: "[project]/components/notifications/NotificationItem.tsx",
                lineNumber: 51,
                columnNumber: 9
            }, ("TURBOPACK compile-time value", void 0))
        }, void 0, false, {
            fileName: "[project]/components/notifications/NotificationItem.tsx",
            lineNumber: 50,
            columnNumber: 7
        }, ("TURBOPACK compile-time value", void 0))
    },
    BOOKING_CONFIRMED: {
        borderColor: 'border-l-teal-500',
        iconColor: 'text-teal-500',
        icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
            className: "w-5 h-5",
            fill: "none",
            viewBox: "0 0 24 24",
            stroke: "currentColor",
            strokeWidth: 2,
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                strokeLinecap: "round",
                strokeLinejoin: "round",
                d: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            }, void 0, false, {
                fileName: "[project]/components/notifications/NotificationItem.tsx",
                lineNumber: 60,
                columnNumber: 9
            }, ("TURBOPACK compile-time value", void 0))
        }, void 0, false, {
            fileName: "[project]/components/notifications/NotificationItem.tsx",
            lineNumber: 59,
            columnNumber: 7
        }, ("TURBOPACK compile-time value", void 0))
    },
    ORGANIZER_ANNOUNCEMENT: {
        borderColor: 'border-l-green-500',
        iconColor: 'text-green-500',
        icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
            className: "w-5 h-5",
            fill: "none",
            viewBox: "0 0 24 24",
            stroke: "currentColor",
            strokeWidth: 2,
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                strokeLinecap: "round",
                strokeLinejoin: "round",
                d: "M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"
            }, void 0, false, {
                fileName: "[project]/components/notifications/NotificationItem.tsx",
                lineNumber: 69,
                columnNumber: 9
            }, ("TURBOPACK compile-time value", void 0))
        }, void 0, false, {
            fileName: "[project]/components/notifications/NotificationItem.tsx",
            lineNumber: 68,
            columnNumber: 7
        }, ("TURBOPACK compile-time value", void 0))
    }
};
const NotificationItem = ({ notification, onMarkAsRead, onDelete, onNavigate, isMarkingAsRead })=>{
    const config = typeConfig[notification.type] || typeConfig.EVENT_REMINDER;
    const hasLink = !!(notification.link || notification.eventId);
    const targetLink = notification.link || (notification.eventId ? `/events/${notification.eventId}` : null);
    const handleClick = ()=>{
        if (!notification.isRead) {
            onMarkAsRead(notification.id);
        }
        if (hasLink && targetLink) {
            onNavigate(targetLink);
        }
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: `border-l-4 ${config.borderColor} px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors relative group ${hasLink ? 'cursor-pointer' : ''}`,
        onClick: handleClick,
        role: hasLink ? 'button' : undefined,
        tabIndex: hasLink ? 0 : undefined,
        onKeyDown: (e)=>{
            if (hasLink && (e.key === 'Enter' || e.key === ' ')) {
                e.preventDefault();
                handleClick();
            }
        },
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-start space-x-3",
                children: [
                    !notification.isRead && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "w-2 h-2 bg-blue-500 rounded-full mt-1.5 flex-shrink-0"
                    }, void 0, false, {
                        fileName: "[project]/components/notifications/NotificationItem.tsx",
                        lineNumber: 105,
                        columnNumber: 11
                    }, ("TURBOPACK compile-time value", void 0)),
                    notification.isRead && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "w-2 h-2 flex-shrink-0"
                    }, void 0, false, {
                        fileName: "[project]/components/notifications/NotificationItem.tsx",
                        lineNumber: 108,
                        columnNumber: 11
                    }, ("TURBOPACK compile-time value", void 0)),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: `flex-shrink-0 mt-0.5 ${config.iconColor}`,
                        children: config.icon
                    }, void 0, false, {
                        fileName: "[project]/components/notifications/NotificationItem.tsx",
                        lineNumber: 110,
                        columnNumber: 9
                    }, ("TURBOPACK compile-time value", void 0)),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex-1 min-w-0",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-start justify-between gap-2",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "font-medium text-gray-900 dark:text-gray-100 text-sm",
                                        children: notification.title
                                    }, void 0, false, {
                                        fileName: "[project]/components/notifications/NotificationItem.tsx",
                                        lineNumber: 115,
                                        columnNumber: 13
                                    }, ("TURBOPACK compile-time value", void 0)),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-xs text-gray-400 dark:text-gray-500 flex-shrink-0 whitespace-nowrap",
                                        children: getRelativeTime(notification.createdAt)
                                    }, void 0, false, {
                                        fileName: "[project]/components/notifications/NotificationItem.tsx",
                                        lineNumber: 118,
                                        columnNumber: 13
                                    }, ("TURBOPACK compile-time value", void 0))
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/notifications/NotificationItem.tsx",
                                lineNumber: 114,
                                columnNumber: 11
                            }, ("TURBOPACK compile-time value", void 0)),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mt-0.5",
                                children: notification.message
                            }, void 0, false, {
                                fileName: "[project]/components/notifications/NotificationItem.tsx",
                                lineNumber: 122,
                                columnNumber: 11
                            }, ("TURBOPACK compile-time value", void 0))
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/notifications/NotificationItem.tsx",
                        lineNumber: 113,
                        columnNumber: 9
                    }, ("TURBOPACK compile-time value", void 0)),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: (e)=>{
                            e.stopPropagation();
                            onDelete(notification.id);
                        },
                        className: "opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-all flex-shrink-0 p-0.5",
                        "aria-label": "Eliminar notificaci\\u00f3n",
                        title: "Eliminar",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                            className: "w-4 h-4",
                            fill: "none",
                            viewBox: "0 0 24 24",
                            stroke: "currentColor",
                            strokeWidth: 2,
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                strokeLinecap: "round",
                                strokeLinejoin: "round",
                                d: "M6 18L18 6M6 6l12 12"
                            }, void 0, false, {
                                fileName: "[project]/components/notifications/NotificationItem.tsx",
                                lineNumber: 133,
                                columnNumber: 13
                            }, ("TURBOPACK compile-time value", void 0))
                        }, void 0, false, {
                            fileName: "[project]/components/notifications/NotificationItem.tsx",
                            lineNumber: 132,
                            columnNumber: 11
                        }, ("TURBOPACK compile-time value", void 0))
                    }, void 0, false, {
                        fileName: "[project]/components/notifications/NotificationItem.tsx",
                        lineNumber: 126,
                        columnNumber: 9
                    }, ("TURBOPACK compile-time value", void 0))
                ]
            }, void 0, true, {
                fileName: "[project]/components/notifications/NotificationItem.tsx",
                lineNumber: 103,
                columnNumber: 7
            }, ("TURBOPACK compile-time value", void 0)),
            isMarkingAsRead && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "absolute inset-0 bg-white/50 dark:bg-gray-900/50 rounded pointer-events-none"
            }, void 0, false, {
                fileName: "[project]/components/notifications/NotificationItem.tsx",
                lineNumber: 138,
                columnNumber: 9
            }, ("TURBOPACK compile-time value", void 0))
        ]
    }, void 0, true, {
        fileName: "[project]/components/notifications/NotificationItem.tsx",
        lineNumber: 96,
        columnNumber: 5
    }, ("TURBOPACK compile-time value", void 0));
};
_c = NotificationItem;
var _c;
__turbopack_context__.k.register(_c, "NotificationItem");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/notifications/NotificationDropdown.tsx [client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "NotificationDropdown",
    ()=>NotificationDropdown
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react/jsx-dev-runtime.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react/index.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$router$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/router.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$auth$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/auth.tsx [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$queries$2f$useNotifications$2e$ts__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/queries/useNotifications.ts [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$notifications$2f$NotificationItem$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/notifications/NotificationItem.tsx [client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
;
;
;
;
;
const NotificationDropdown = ({ onClose })=>{
    _s();
    const { token } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$auth$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["useAuth"])();
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$router$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useRouter"])();
    const [page, setPage] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])(1);
    const [readingIds, setReadingIds] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])(new Set());
    const { data, isLoading, isError, refetch } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$queries$2f$useNotifications$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["useNotifications"])(token, {
        page,
        unreadOnly: false
    });
    const { data: unreadData } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$queries$2f$useNotifications$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["useUnreadCount"])(token);
    const markAsRead = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$queries$2f$useNotifications$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["useMarkAsRead"])(token);
    const markAllAsRead = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$queries$2f$useNotifications$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["useMarkAllAsRead"])(token);
    const deleteNotification = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$queries$2f$useNotifications$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["useDeleteNotification"])(token);
    const deleteRead = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$queries$2f$useNotifications$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["useDeleteReadNotifications"])(token);
    const unreadCount = unreadData?.data?.unreadCount ?? 0;
    const notifications = data?.data ?? [];
    const pagination = data?.pagination;
    const handleMarkAsRead = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "NotificationDropdown.useCallback[handleMarkAsRead]": (id)=>{
            setReadingIds({
                "NotificationDropdown.useCallback[handleMarkAsRead]": (prev)=>new Set(prev).add(id)
            }["NotificationDropdown.useCallback[handleMarkAsRead]"]);
            markAsRead.mutate(id, {
                onSettled: {
                    "NotificationDropdown.useCallback[handleMarkAsRead]": ()=>{
                        setReadingIds({
                            "NotificationDropdown.useCallback[handleMarkAsRead]": (prev)=>{
                                const next = new Set(prev);
                                next.delete(id);
                                return next;
                            }
                        }["NotificationDropdown.useCallback[handleMarkAsRead]"]);
                    }
                }["NotificationDropdown.useCallback[handleMarkAsRead]"]
            });
        }
    }["NotificationDropdown.useCallback[handleMarkAsRead]"], [
        markAsRead
    ]);
    const handleDelete = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "NotificationDropdown.useCallback[handleDelete]": (id)=>{
            deleteNotification.mutate(id);
        }
    }["NotificationDropdown.useCallback[handleDelete]"], [
        deleteNotification
    ]);
    const handleNavigate = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "NotificationDropdown.useCallback[handleNavigate]": (link)=>{
            onClose();
            router.push(link);
        }
    }["NotificationDropdown.useCallback[handleNavigate]"], [
        onClose,
        router
    ]);
    const handleLoadMore = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "NotificationDropdown.useCallback[handleLoadMore]": ()=>{
            if (pagination?.hasNext) {
                setPage({
                    "NotificationDropdown.useCallback[handleLoadMore]": (prev)=>prev + 1
                }["NotificationDropdown.useCallback[handleLoadMore]"]);
            }
        }
    }["NotificationDropdown.useCallback[handleLoadMore]"], [
        pagination?.hasNext
    ]);
    const handleMarkAllRead = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "NotificationDropdown.useCallback[handleMarkAllRead]": ()=>{
            markAllAsRead.mutate();
        }
    }["NotificationDropdown.useCallback[handleMarkAllRead]"], [
        markAllAsRead
    ]);
    const handleCleanup = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "NotificationDropdown.useCallback[handleCleanup]": ()=>{
            deleteRead.mutate();
        }
    }["NotificationDropdown.useCallback[handleCleanup]"], [
        deleteRead
    ]);
    const hasReadNotifications = notifications.some((n)=>n.isRead);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "absolute right-0 mt-2 w-80 sm:w-96 max-h-[480px] overflow-y-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50",
        role: "menu",
        "aria-label": "Lista de notificaciones",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3 z-10",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex items-center justify-between",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                            className: "font-semibold text-gray-900 dark:text-gray-100 text-sm",
                            children: [
                                "Notificaciones",
                                unreadCount > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "ml-2 text-xs text-gray-500 dark:text-gray-400 font-normal",
                                    children: [
                                        "(",
                                        unreadCount,
                                        " sin leer)"
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/notifications/NotificationDropdown.tsx",
                                    lineNumber: 86,
                                    columnNumber: 15
                                }, ("TURBOPACK compile-time value", void 0))
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/notifications/NotificationDropdown.tsx",
                            lineNumber: 83,
                            columnNumber: 11
                        }, ("TURBOPACK compile-time value", void 0)),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex items-center space-x-2",
                            children: [
                                unreadCount > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: handleMarkAllRead,
                                    className: "text-xs text-blue-600 dark:text-blue-400 hover:underline",
                                    disabled: markAllAsRead.isPending,
                                    children: markAllAsRead.isPending ? '...' : 'Marcar todas leídas'
                                }, void 0, false, {
                                    fileName: "[project]/components/notifications/NotificationDropdown.tsx",
                                    lineNumber: 93,
                                    columnNumber: 15
                                }, ("TURBOPACK compile-time value", void 0)),
                                hasReadNotifications && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: handleCleanup,
                                    className: "text-xs text-gray-400 hover:text-red-500 dark:hover:text-red-400 disabled:opacity-50",
                                    title: "Limpiar leídas",
                                    disabled: deleteRead.isPending,
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                        className: "w-4 h-4",
                                        fill: "none",
                                        viewBox: "0 0 24 24",
                                        stroke: "currentColor",
                                        strokeWidth: 2,
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                            strokeLinecap: "round",
                                            strokeLinejoin: "round",
                                            d: "M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                        }, void 0, false, {
                                            fileName: "[project]/components/notifications/NotificationDropdown.tsx",
                                            lineNumber: 109,
                                            columnNumber: 19
                                        }, ("TURBOPACK compile-time value", void 0))
                                    }, void 0, false, {
                                        fileName: "[project]/components/notifications/NotificationDropdown.tsx",
                                        lineNumber: 108,
                                        columnNumber: 17
                                    }, ("TURBOPACK compile-time value", void 0))
                                }, void 0, false, {
                                    fileName: "[project]/components/notifications/NotificationDropdown.tsx",
                                    lineNumber: 102,
                                    columnNumber: 15
                                }, ("TURBOPACK compile-time value", void 0))
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/notifications/NotificationDropdown.tsx",
                            lineNumber: 91,
                            columnNumber: 11
                        }, ("TURBOPACK compile-time value", void 0))
                    ]
                }, void 0, true, {
                    fileName: "[project]/components/notifications/NotificationDropdown.tsx",
                    lineNumber: 82,
                    columnNumber: 9
                }, ("TURBOPACK compile-time value", void 0))
            }, void 0, false, {
                fileName: "[project]/components/notifications/NotificationDropdown.tsx",
                lineNumber: 81,
                columnNumber: 7
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "divide-y divide-gray-100 dark:divide-gray-700",
                children: [
                    isLoading && page === 1 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "p-4 space-y-3",
                        children: [
                            1,
                            2,
                            3
                        ].map((i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "animate-pulse flex space-x-3",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "w-2 h-2 bg-gray-200 dark:bg-gray-600 rounded-full mt-1"
                                    }, void 0, false, {
                                        fileName: "[project]/components/notifications/NotificationDropdown.tsx",
                                        lineNumber: 123,
                                        columnNumber: 17
                                    }, ("TURBOPACK compile-time value", void 0)),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex-1 space-y-2",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "h-3 bg-gray-200 dark:bg-gray-600 rounded w-3/4"
                                            }, void 0, false, {
                                                fileName: "[project]/components/notifications/NotificationDropdown.tsx",
                                                lineNumber: 125,
                                                columnNumber: 19
                                            }, ("TURBOPACK compile-time value", void 0)),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "h-2 bg-gray-200 dark:bg-gray-600 rounded w-1/2"
                                            }, void 0, false, {
                                                fileName: "[project]/components/notifications/NotificationDropdown.tsx",
                                                lineNumber: 126,
                                                columnNumber: 19
                                            }, ("TURBOPACK compile-time value", void 0))
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/notifications/NotificationDropdown.tsx",
                                        lineNumber: 124,
                                        columnNumber: 17
                                    }, ("TURBOPACK compile-time value", void 0))
                                ]
                            }, i, true, {
                                fileName: "[project]/components/notifications/NotificationDropdown.tsx",
                                lineNumber: 122,
                                columnNumber: 15
                            }, ("TURBOPACK compile-time value", void 0)))
                    }, void 0, false, {
                        fileName: "[project]/components/notifications/NotificationDropdown.tsx",
                        lineNumber: 120,
                        columnNumber: 11
                    }, ("TURBOPACK compile-time value", void 0)),
                    isError && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "p-8 text-center",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-sm text-gray-500 dark:text-gray-400 mb-3",
                                children: "Error al cargar notificaciones"
                            }, void 0, false, {
                                fileName: "[project]/components/notifications/NotificationDropdown.tsx",
                                lineNumber: 135,
                                columnNumber: 13
                            }, ("TURBOPACK compile-time value", void 0)),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: ()=>refetch(),
                                className: "text-sm text-blue-600 dark:text-blue-400 hover:underline",
                                children: "Reintentar"
                            }, void 0, false, {
                                fileName: "[project]/components/notifications/NotificationDropdown.tsx",
                                lineNumber: 138,
                                columnNumber: 13
                            }, ("TURBOPACK compile-time value", void 0))
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/notifications/NotificationDropdown.tsx",
                        lineNumber: 134,
                        columnNumber: 11
                    }, ("TURBOPACK compile-time value", void 0)),
                    !isLoading && !isError && notifications.length === 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "p-8 text-center",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                className: "w-10 h-10 mx-auto text-gray-300 dark:text-gray-600 mb-2",
                                fill: "none",
                                viewBox: "0 0 24 24",
                                stroke: "currentColor",
                                strokeWidth: 1.5,
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                    strokeLinecap: "round",
                                    strokeLinejoin: "round",
                                    d: "M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                                }, void 0, false, {
                                    fileName: "[project]/components/notifications/NotificationDropdown.tsx",
                                    lineNumber: 150,
                                    columnNumber: 15
                                }, ("TURBOPACK compile-time value", void 0))
                            }, void 0, false, {
                                fileName: "[project]/components/notifications/NotificationDropdown.tsx",
                                lineNumber: 149,
                                columnNumber: 13
                            }, ("TURBOPACK compile-time value", void 0)),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-sm text-gray-400 dark:text-gray-500",
                                children: "No tienes notificaciones"
                            }, void 0, false, {
                                fileName: "[project]/components/notifications/NotificationDropdown.tsx",
                                lineNumber: 152,
                                columnNumber: 13
                            }, ("TURBOPACK compile-time value", void 0))
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/notifications/NotificationDropdown.tsx",
                        lineNumber: 148,
                        columnNumber: 11
                    }, ("TURBOPACK compile-time value", void 0)),
                    notifications.map((n)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$notifications$2f$NotificationItem$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["NotificationItem"], {
                            notification: n,
                            onMarkAsRead: handleMarkAsRead,
                            onDelete: handleDelete,
                            onNavigate: handleNavigate,
                            isMarkingAsRead: readingIds.has(n.id)
                        }, n.id, false, {
                            fileName: "[project]/components/notifications/NotificationDropdown.tsx",
                            lineNumber: 159,
                            columnNumber: 11
                        }, ("TURBOPACK compile-time value", void 0))),
                    pagination?.hasNext && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "p-3 text-center",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            onClick: handleLoadMore,
                            className: "text-sm text-blue-600 dark:text-blue-400 hover:underline",
                            disabled: isLoading,
                            children: isLoading ? 'Cargando...' : 'Cargar más'
                        }, void 0, false, {
                            fileName: "[project]/components/notifications/NotificationDropdown.tsx",
                            lineNumber: 171,
                            columnNumber: 13
                        }, ("TURBOPACK compile-time value", void 0))
                    }, void 0, false, {
                        fileName: "[project]/components/notifications/NotificationDropdown.tsx",
                        lineNumber: 170,
                        columnNumber: 11
                    }, ("TURBOPACK compile-time value", void 0))
                ]
            }, void 0, true, {
                fileName: "[project]/components/notifications/NotificationDropdown.tsx",
                lineNumber: 118,
                columnNumber: 7
            }, ("TURBOPACK compile-time value", void 0))
        ]
    }, void 0, true, {
        fileName: "[project]/components/notifications/NotificationDropdown.tsx",
        lineNumber: 75,
        columnNumber: 5
    }, ("TURBOPACK compile-time value", void 0));
};
_s(NotificationDropdown, "mLhp8EZBcBCAXYmob4LHL7iGdH4=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$auth$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["useAuth"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$router$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useRouter"],
        __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$queries$2f$useNotifications$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["useNotifications"],
        __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$queries$2f$useNotifications$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["useUnreadCount"],
        __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$queries$2f$useNotifications$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["useMarkAsRead"],
        __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$queries$2f$useNotifications$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["useMarkAllAsRead"],
        __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$queries$2f$useNotifications$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["useDeleteNotification"],
        __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$queries$2f$useNotifications$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["useDeleteReadNotifications"]
    ];
});
_c = NotificationDropdown;
var _c;
__turbopack_context__.k.register(_c, "NotificationDropdown");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/notifications/NotificationBell.tsx [client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "NotificationBell",
    ()=>NotificationBell
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react/jsx-dev-runtime.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react/index.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$auth$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/auth.tsx [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$queries$2f$useNotifications$2e$ts__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/queries/useNotifications.ts [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$notifications$2f$NotificationDropdown$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/notifications/NotificationDropdown.tsx [client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
;
;
;
;
const NotificationBell = ()=>{
    _s();
    const { user, token } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$auth$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["useAuth"])();
    const [isOpen, setIsOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const containerRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const { data: unreadData } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$queries$2f$useNotifications$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["useUnreadCount"])(token);
    const unreadCount = unreadData?.data?.unreadCount ?? 0;
    const handleClose = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "NotificationBell.useCallback[handleClose]": ()=>{
            setIsOpen(false);
        }
    }["NotificationBell.useCallback[handleClose]"], []);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "NotificationBell.useEffect": ()=>{
            const handleClickOutside = {
                "NotificationBell.useEffect.handleClickOutside": (event)=>{
                    if (containerRef.current && !containerRef.current.contains(event.target)) {
                        setIsOpen(false);
                    }
                }
            }["NotificationBell.useEffect.handleClickOutside"];
            document.addEventListener('mousedown', handleClickOutside);
            return ({
                "NotificationBell.useEffect": ()=>document.removeEventListener('mousedown', handleClickOutside)
            })["NotificationBell.useEffect"];
        }
    }["NotificationBell.useEffect"], []);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "NotificationBell.useEffect": ()=>{
            const handleEscape = {
                "NotificationBell.useEffect.handleEscape": (event)=>{
                    if (event.key === 'Escape') {
                        setIsOpen(false);
                    }
                }
            }["NotificationBell.useEffect.handleEscape"];
            document.addEventListener('keydown', handleEscape);
            return ({
                "NotificationBell.useEffect": ()=>document.removeEventListener('keydown', handleEscape)
            })["NotificationBell.useEffect"];
        }
    }["NotificationBell.useEffect"], []);
    if (!user) return null;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "relative",
        ref: containerRef,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                onClick: ()=>setIsOpen(!isOpen),
                type: "button",
                "aria-label": `Notificaciones${unreadCount > 0 ? `, ${unreadCount} sin leer` : ''}`,
                "aria-expanded": isOpen,
                "aria-haspopup": "menu",
                className: "relative p-2 rounded-full text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                        className: "w-5 h-5",
                        fill: "none",
                        viewBox: "0 0 24 24",
                        stroke: "currentColor",
                        strokeWidth: 2,
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                            strokeLinecap: "round",
                            strokeLinejoin: "round",
                            d: "M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                        }, void 0, false, {
                            fileName: "[project]/components/notifications/NotificationBell.tsx",
                            lineNumber: 52,
                            columnNumber: 11
                        }, ("TURBOPACK compile-time value", void 0))
                    }, void 0, false, {
                        fileName: "[project]/components/notifications/NotificationBell.tsx",
                        lineNumber: 51,
                        columnNumber: 9
                    }, ("TURBOPACK compile-time value", void 0)),
                    unreadCount > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "absolute -top-0.5 -right-0.5 bg-red-500 text-white text-xs font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 leading-none shadow-sm",
                        children: unreadCount > 99 ? '99+' : unreadCount
                    }, void 0, false, {
                        fileName: "[project]/components/notifications/NotificationBell.tsx",
                        lineNumber: 55,
                        columnNumber: 11
                    }, ("TURBOPACK compile-time value", void 0))
                ]
            }, void 0, true, {
                fileName: "[project]/components/notifications/NotificationBell.tsx",
                lineNumber: 43,
                columnNumber: 7
            }, ("TURBOPACK compile-time value", void 0)),
            isOpen && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$notifications$2f$NotificationDropdown$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["NotificationDropdown"], {
                onClose: handleClose
            }, void 0, false, {
                fileName: "[project]/components/notifications/NotificationBell.tsx",
                lineNumber: 60,
                columnNumber: 18
            }, ("TURBOPACK compile-time value", void 0))
        ]
    }, void 0, true, {
        fileName: "[project]/components/notifications/NotificationBell.tsx",
        lineNumber: 42,
        columnNumber: 5
    }, ("TURBOPACK compile-time value", void 0));
};
_s(NotificationBell, "XpMMF+O29JfxLpu7VB31MMYWCr8=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$auth$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["useAuth"],
        __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$queries$2f$useNotifications$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["useUnreadCount"]
    ];
});
_c = NotificationBell;
var _c;
__turbopack_context__.k.register(_c, "NotificationBell");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/Layout.tsx [client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Layout",
    ()=>Layout
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react/jsx-dev-runtime.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$link$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/link.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$Button$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/ui/Button.tsx [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$UserMenu$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/UserMenu.tsx [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$ThemeToggle$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/ui/ThemeToggle.tsx [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$notifications$2f$NotificationBell$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/notifications/NotificationBell.tsx [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$auth$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/auth.tsx [client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
;
;
;
;
;
;
const Layout = ({ children })=>{
    _s();
    const { user } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$auth$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["useAuth"])();
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "min-h-screen bg-gray-50 dark:bg-gray-900",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("nav", {
                className: "bg-white shadow-sm border-b border-gray-200 dark:bg-gray-800 dark:border-gray-700",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex justify-between h-16",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$link$2e$js__$5b$client$5d$__$28$ecmascript$29$__["default"], {
                                    href: "/",
                                    className: "text-xl font-bold text-gray-900 dark:text-gray-100",
                                    children: "Eventos Córdoba"
                                }, void 0, false, {
                                    fileName: "[project]/components/Layout.tsx",
                                    lineNumber: 23,
                                    columnNumber: 15
                                }, ("TURBOPACK compile-time value", void 0))
                            }, void 0, false, {
                                fileName: "[project]/components/Layout.tsx",
                                lineNumber: 22,
                                columnNumber: 13
                            }, ("TURBOPACK compile-time value", void 0)),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center space-x-2 sm:space-x-4",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$link$2e$js__$5b$client$5d$__$28$ecmascript$29$__["default"], {
                                        href: "/events",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$Button$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["Button"], {
                                            variant: "secondary",
                                            size: "sm",
                                            children: "Eventos"
                                        }, void 0, false, {
                                            fileName: "[project]/components/Layout.tsx",
                                            lineNumber: 30,
                                            columnNumber: 17
                                        }, ("TURBOPACK compile-time value", void 0))
                                    }, void 0, false, {
                                        fileName: "[project]/components/Layout.tsx",
                                        lineNumber: 29,
                                        columnNumber: 15
                                    }, ("TURBOPACK compile-time value", void 0)),
                                    user && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$link$2e$js__$5b$client$5d$__$28$ecmascript$29$__["default"], {
                                        href: "/favorites",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$Button$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["Button"], {
                                            variant: "secondary",
                                            size: "sm",
                                            children: "Favoritos"
                                        }, void 0, false, {
                                            fileName: "[project]/components/Layout.tsx",
                                            lineNumber: 36,
                                            columnNumber: 19
                                        }, ("TURBOPACK compile-time value", void 0))
                                    }, void 0, false, {
                                        fileName: "[project]/components/Layout.tsx",
                                        lineNumber: 35,
                                        columnNumber: 17
                                    }, ("TURBOPACK compile-time value", void 0)),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$ThemeToggle$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["ThemeToggle"], {}, void 0, false, {
                                        fileName: "[project]/components/Layout.tsx",
                                        lineNumber: 41,
                                        columnNumber: 15
                                    }, ("TURBOPACK compile-time value", void 0)),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$notifications$2f$NotificationBell$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["NotificationBell"], {}, void 0, false, {
                                        fileName: "[project]/components/Layout.tsx",
                                        lineNumber: 42,
                                        columnNumber: 15
                                    }, ("TURBOPACK compile-time value", void 0)),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$UserMenu$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["UserMenu"], {}, void 0, false, {
                                        fileName: "[project]/components/Layout.tsx",
                                        lineNumber: 43,
                                        columnNumber: 15
                                    }, ("TURBOPACK compile-time value", void 0))
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/Layout.tsx",
                                lineNumber: 28,
                                columnNumber: 13
                            }, ("TURBOPACK compile-time value", void 0))
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/Layout.tsx",
                        lineNumber: 21,
                        columnNumber: 11
                    }, ("TURBOPACK compile-time value", void 0))
                }, void 0, false, {
                    fileName: "[project]/components/Layout.tsx",
                    lineNumber: 20,
                    columnNumber: 9
                }, ("TURBOPACK compile-time value", void 0))
            }, void 0, false, {
                fileName: "[project]/components/Layout.tsx",
                lineNumber: 19,
                columnNumber: 7
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("main", {
                className: "max-w-7xl mx-auto py-6 sm:px-6 lg:px-8",
                children: children
            }, void 0, false, {
                fileName: "[project]/components/Layout.tsx",
                lineNumber: 50,
                columnNumber: 7
            }, ("TURBOPACK compile-time value", void 0))
        ]
    }, void 0, true, {
        fileName: "[project]/components/Layout.tsx",
        lineNumber: 17,
        columnNumber: 5
    }, ("TURBOPACK compile-time value", void 0));
};
_s(Layout, "9ep4vdl3mBfipxjmc+tQCDhw6Ik=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$auth$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["useAuth"]
    ];
});
_c = Layout;
var _c;
__turbopack_context__.k.register(_c, "Layout");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/lib/useEventFilters.ts [client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "useEventFilters",
    ()=>useEventFilters
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$router$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/router.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react/index.js [client] (ecmascript)");
var _s = __turbopack_context__.k.signature();
;
;
const DEFAULT_FILTERS = {
    page: 1,
    limit: 12,
    sortBy: 'date',
    sortOrder: 'asc'
};
function useEventFilters() {
    _s();
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$router$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useRouter"])();
    const filters = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "useEventFilters.useMemo[filters]": ()=>{
            const q = router.query;
            return {
                ...DEFAULT_FILTERS,
                ...q.page && {
                    page: Math.max(1, Number(q.page))
                },
                ...q.limit && {
                    limit: Math.min(50, Math.max(1, Number(q.limit)))
                },
                ...q.category && {
                    category: Number(q.category)
                },
                ...q.search && {
                    search: String(q.search)
                },
                ...q.datePreset === 'today' || q.datePreset === 'this_week' || q.datePreset === 'this_weekend' || q.datePreset === 'upcoming' ? {
                    datePreset: q.datePreset
                } : {},
                ...q.dateFrom && {
                    dateFrom: String(q.dateFrom)
                },
                ...q.dateTo && {
                    dateTo: String(q.dateTo)
                },
                ...q.minPrice != null && {
                    minPrice: Number(q.minPrice)
                },
                ...q.maxPrice != null && {
                    maxPrice: Number(q.maxPrice)
                },
                ...q.minRating != null && {
                    minRating: Number(q.minRating)
                },
                ...q.available === 'true' && {
                    available: true
                },
                ...q.soldOut === 'true' && {
                    soldOut: true
                },
                ...q.isFree === 'true' && {
                    isFree: true
                },
                ...q.sortBy === 'price' || q.sortBy === 'averageRating' || q.sortBy === 'createdAt' || q.sortBy === 'title' ? {
                    sortBy: q.sortBy
                } : {},
                ...q.sortOrder === 'desc' && {
                    sortOrder: 'desc'
                }
            };
        }
    }["useEventFilters.useMemo[filters]"], [
        router.query
    ]);
    const setFilters = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "useEventFilters.useCallback[setFilters]": (updates)=>{
            const merged = {
                ...filters,
                ...updates
            };
            if (!('page' in updates)) {
                merged.page = 1;
            }
            const params = new URLSearchParams();
            Object.entries(merged).forEach({
                "useEventFilters.useCallback[setFilters]": ([key, value])=>{
                    if (value != null && value !== '' && value !== false) {
                        params.set(key, String(value));
                    }
                }
            }["useEventFilters.useCallback[setFilters]"]);
            router.push(`/events?${params.toString()}`, undefined, {
                shallow: true
            });
        }
    }["useEventFilters.useCallback[setFilters]"], [
        router,
        filters
    ]);
    const resetFilters = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "useEventFilters.useCallback[resetFilters]": ()=>{
            router.push('/events', undefined, {
                shallow: true
            });
        }
    }["useEventFilters.useCallback[resetFilters]"], [
        router
    ]);
    const removeFilter = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "useEventFilters.useCallback[removeFilter]": (key)=>{
            const newFilters = {
                ...filters
            };
            delete newFilters[key];
            newFilters.page = 1;
            const params = new URLSearchParams();
            Object.entries(newFilters).forEach({
                "useEventFilters.useCallback[removeFilter]": ([k, v])=>{
                    if (v != null && v !== '' && v !== false) {
                        params.set(k, String(v));
                    }
                }
            }["useEventFilters.useCallback[removeFilter]"]);
            router.push(`/events?${params.toString()}`, undefined, {
                shallow: true
            });
        }
    }["useEventFilters.useCallback[removeFilter]"], [
        router,
        filters
    ]);
    const activeFilterCount = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "useEventFilters.useMemo[activeFilterCount]": ()=>{
            let count = 0;
            if (filters.category) count++;
            if (filters.search) count++;
            if (filters.datePreset || filters.dateFrom || filters.dateTo) count++;
            if (filters.minPrice != null || filters.maxPrice != null) count++;
            if (filters.minRating != null) count++;
            if (filters.available) count++;
            if (filters.soldOut) count++;
            if (filters.isFree) count++;
            if (filters.sortBy !== 'date') count++;
            if (filters.sortOrder !== 'asc') count++;
            return count;
        }
    }["useEventFilters.useMemo[activeFilterCount]"], [
        filters
    ]);
    return {
        filters,
        setFilters,
        resetFilters,
        removeFilter,
        activeFilterCount
    };
}
_s(useEventFilters, "xHEJ/xDLqBZG/dVtIoXQRCU9nF8=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$router$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useRouter"]
    ];
});
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/lib/queries/useEvents.ts [client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "useEvents",
    ()=>useEvents,
    "useFiltersMeta",
    ()=>useFiltersMeta
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useQuery$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@tanstack/react-query/build/modern/useQuery.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2e$ts__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/api.ts [client] (ecmascript)");
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature();
;
;
function useEvents(filters, token) {
    _s();
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value])=>{
        if (value != null && value !== '' && value !== false) {
            params.set(key, String(value));
        }
    });
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useQuery$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useQuery"])({
        queryKey: [
            'events',
            filters
        ],
        queryFn: {
            "useEvents.useQuery": ()=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["apiFetch"])(`/api/events?${params.toString()}`, {
                    token
                })
        }["useEvents.useQuery"],
        staleTime: 30_000,
        gcTime: 300_000
    });
}
_s(useEvents, "4ZpngI1uv+Uo3WQHEZmTQ5FNM+k=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useQuery$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useQuery"]
    ];
});
function useFiltersMeta() {
    _s1();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useQuery$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useQuery"])({
        queryKey: [
            'filters-meta'
        ],
        queryFn: {
            "useFiltersMeta.useQuery": ()=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["apiFetch"])('/api/events/filters-meta')
        }["useFiltersMeta.useQuery"],
        staleTime: 60_000,
        gcTime: 600_000
    });
}
_s1(useFiltersMeta, "4ZpngI1uv+Uo3WQHEZmTQ5FNM+k=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useQuery$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useQuery"]
    ];
});
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/lib/useDebounce.ts [client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "useDebounce",
    ()=>useDebounce
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react/index.js [client] (ecmascript)");
var _s = __turbopack_context__.k.signature();
;
function useDebounce(value, delay) {
    _s();
    const [debouncedValue, setDebouncedValue] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])(value);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "useDebounce.useEffect": ()=>{
            const timer = setTimeout({
                "useDebounce.useEffect.timer": ()=>setDebouncedValue(value)
            }["useDebounce.useEffect.timer"], delay);
            return ({
                "useDebounce.useEffect": ()=>clearTimeout(timer)
            })["useDebounce.useEffect"];
        }
    }["useDebounce.useEffect"], [
        value,
        delay
    ]);
    return debouncedValue;
}
_s(useDebounce, "KDuPAtDOgxm8PU6legVJOb3oOmA=");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/filters/DatePresetFilter.tsx [client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>DatePresetFilter
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react/jsx-dev-runtime.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$Button$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/ui/Button.tsx [client] (ecmascript)");
;
;
const PRESETS = [
    {
        key: 'today',
        label: 'Hoy'
    },
    {
        key: 'this_week',
        label: 'Esta semana'
    },
    {
        key: 'this_weekend',
        label: 'Este fin de semana'
    },
    {
        key: 'upcoming',
        label: 'Próximos'
    }
];
function DatePresetFilter({ value, onChange }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "flex flex-wrap gap-2",
        children: PRESETS.map((preset)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$Button$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["Button"], {
                variant: value === preset.key ? 'primary' : 'secondary',
                size: "sm",
                onClick: ()=>onChange(value === preset.key ? undefined : preset.key),
                children: preset.label
            }, preset.key, false, {
                fileName: "[project]/components/filters/DatePresetFilter.tsx",
                lineNumber: 20,
                columnNumber: 9
            }, this))
    }, void 0, false, {
        fileName: "[project]/components/filters/DatePresetFilter.tsx",
        lineNumber: 18,
        columnNumber: 5
    }, this);
}
_c = DatePresetFilter;
var _c;
__turbopack_context__.k.register(_c, "DatePresetFilter");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/filters/PriceRangeFilter.tsx [client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>PriceRangeFilter
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react/jsx-dev-runtime.js [client] (ecmascript)");
;
function PriceRangeFilter({ minPrice, maxPrice, priceMin, priceMax, onChange, onFreeToggle, isFree }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "flex flex-col gap-2",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                className: "text-sm font-medium text-gray-700 dark:text-gray-300",
                children: "Precio"
            }, void 0, false, {
                fileName: "[project]/components/filters/PriceRangeFilter.tsx",
                lineNumber: 24,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-center gap-2",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                        type: "number",
                        placeholder: String(priceMin),
                        value: minPrice ?? '',
                        onChange: (e)=>onChange(e.target.value ? Number(e.target.value) : undefined, maxPrice),
                        className: "w-20 px-2 py-1 border rounded text-sm",
                        min: priceMin,
                        max: priceMax,
                        "aria-label": "Precio mínimo"
                    }, void 0, false, {
                        fileName: "[project]/components/filters/PriceRangeFilter.tsx",
                        lineNumber: 26,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "text-gray-400 dark:text-gray-500",
                        children: "—"
                    }, void 0, false, {
                        fileName: "[project]/components/filters/PriceRangeFilter.tsx",
                        lineNumber: 39,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                        type: "number",
                        placeholder: String(priceMax),
                        value: maxPrice ?? '',
                        onChange: (e)=>onChange(minPrice, e.target.value ? Number(e.target.value) : undefined),
                        className: "w-20 px-2 py-1 border rounded text-sm",
                        min: priceMin,
                        max: priceMax,
                        "aria-label": "Precio máximo"
                    }, void 0, false, {
                        fileName: "[project]/components/filters/PriceRangeFilter.tsx",
                        lineNumber: 40,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "text-sm text-gray-500 dark:text-gray-400",
                        children: "€"
                    }, void 0, false, {
                        fileName: "[project]/components/filters/PriceRangeFilter.tsx",
                        lineNumber: 53,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/filters/PriceRangeFilter.tsx",
                lineNumber: 25,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                className: "flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                        type: "checkbox",
                        checked: isFree || false,
                        onChange: onFreeToggle,
                        className: "rounded border-gray-300 dark:border-gray-600"
                    }, void 0, false, {
                        fileName: "[project]/components/filters/PriceRangeFilter.tsx",
                        lineNumber: 56,
                        columnNumber: 9
                    }, this),
                    "Solo gratuitos"
                ]
            }, void 0, true, {
                fileName: "[project]/components/filters/PriceRangeFilter.tsx",
                lineNumber: 55,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/filters/PriceRangeFilter.tsx",
        lineNumber: 23,
        columnNumber: 5
    }, this);
}
_c = PriceRangeFilter;
var _c;
__turbopack_context__.k.register(_c, "PriceRangeFilter");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/filters/RatingFilter.tsx [client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>RatingFilter
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react/jsx-dev-runtime.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react/index.js [client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
;
const RATINGS = [
    5,
    4.5,
    4,
    3.5,
    3,
    2.5,
    2,
    1.5,
    1,
    0.5
];
function RatingFilter({ value, onChange }) {
    _s();
    const [hover, setHover] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const displayValue = hover ?? value;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "flex flex-col gap-1",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                className: "text-sm font-medium text-gray-700 dark:text-gray-300",
                children: "Rating mínimo"
            }, void 0, false, {
                fileName: "[project]/components/filters/RatingFilter.tsx",
                lineNumber: 18,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-center gap-1",
                children: [
                    [
                        1,
                        2,
                        3,
                        4,
                        5
                    ].map((star)=>{
                        const filled = displayValue != null && star <= displayValue;
                        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            type: "button",
                            onMouseEnter: ()=>setHover(star),
                            onMouseLeave: ()=>setHover(null),
                            onClick: ()=>onChange(value === star ? undefined : star),
                            className: `text-xl transition-colors ${filled ? 'text-yellow-400 dark:text-yellow-500' : 'text-gray-300 dark:text-gray-600'} hover:text-yellow-400 focus:outline-none`,
                            "aria-label": `${star} estrella${star > 1 ? 's' : ''}`,
                            children: filled ? '★' : '☆'
                        }, star, false, {
                            fileName: "[project]/components/filters/RatingFilter.tsx",
                            lineNumber: 23,
                            columnNumber: 13
                        }, this);
                    }),
                    value != null && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "text-sm text-gray-500 dark:text-gray-400 ml-1",
                        children: [
                            value,
                            "+"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/filters/RatingFilter.tsx",
                        lineNumber: 39,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/filters/RatingFilter.tsx",
                lineNumber: 19,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/filters/RatingFilter.tsx",
        lineNumber: 17,
        columnNumber: 5
    }, this);
}
_s(RatingFilter, "FYwme2kD2kORRPD1Jfhz4luF6Fk=");
_c = RatingFilter;
var _c;
__turbopack_context__.k.register(_c, "RatingFilter");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/filters/AvailabilityFilter.tsx [client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>AvailabilityFilter
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react/jsx-dev-runtime.js [client] (ecmascript)");
;
function AvailabilityFilter({ available, soldOut, isFree, onChange, totalAvailableEvents, totalSoldOutEvents, totalFreeEvents }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "flex flex-col gap-2",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                className: "text-sm font-medium text-gray-700 dark:text-gray-300",
                children: "Disponibilidad"
            }, void 0, false, {
                fileName: "[project]/components/filters/AvailabilityFilter.tsx",
                lineNumber: 24,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                className: "flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                        type: "checkbox",
                        checked: available || false,
                        onChange: ()=>onChange({
                                available: !available,
                                soldOut: false
                            }),
                        className: "rounded border-gray-300 dark:border-gray-600"
                    }, void 0, false, {
                        fileName: "[project]/components/filters/AvailabilityFilter.tsx",
                        lineNumber: 26,
                        columnNumber: 9
                    }, this),
                    "Con plazas ",
                    totalAvailableEvents != null && `(${totalAvailableEvents})`
                ]
            }, void 0, true, {
                fileName: "[project]/components/filters/AvailabilityFilter.tsx",
                lineNumber: 25,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                className: "flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                        type: "checkbox",
                        checked: soldOut || false,
                        onChange: ()=>onChange({
                                soldOut: !soldOut,
                                available: false
                            }),
                        className: "rounded border-gray-300 dark:border-gray-600"
                    }, void 0, false, {
                        fileName: "[project]/components/filters/AvailabilityFilter.tsx",
                        lineNumber: 35,
                        columnNumber: 9
                    }, this),
                    "Agotados ",
                    totalSoldOutEvents != null && `(${totalSoldOutEvents})`
                ]
            }, void 0, true, {
                fileName: "[project]/components/filters/AvailabilityFilter.tsx",
                lineNumber: 34,
                columnNumber: 7
            }, this),
            totalFreeEvents != null && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                className: "flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                        type: "checkbox",
                        checked: isFree || false,
                        onChange: ()=>onChange({
                                isFree: !isFree
                            }),
                        className: "rounded border-gray-300 dark:border-gray-600"
                    }, void 0, false, {
                        fileName: "[project]/components/filters/AvailabilityFilter.tsx",
                        lineNumber: 45,
                        columnNumber: 11
                    }, this),
                    "Gratuitos (",
                    totalFreeEvents,
                    ")"
                ]
            }, void 0, true, {
                fileName: "[project]/components/filters/AvailabilityFilter.tsx",
                lineNumber: 44,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/filters/AvailabilityFilter.tsx",
        lineNumber: 23,
        columnNumber: 5
    }, this);
}
_c = AvailabilityFilter;
var _c;
__turbopack_context__.k.register(_c, "AvailabilityFilter");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/filters/SortSelect.tsx [client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>SortSelect
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react/jsx-dev-runtime.js [client] (ecmascript)");
;
const OPTIONS = [
    {
        label: 'Fecha (próximos)',
        sortBy: 'date',
        sortOrder: 'asc'
    },
    {
        label: 'Fecha (antiguos)',
        sortBy: 'date',
        sortOrder: 'desc'
    },
    {
        label: 'Precio (menor)',
        sortBy: 'price',
        sortOrder: 'asc'
    },
    {
        label: 'Precio (mayor)',
        sortBy: 'price',
        sortOrder: 'desc'
    },
    {
        label: 'Mejor valorados',
        sortBy: 'averageRating',
        sortOrder: 'desc'
    },
    {
        label: 'Más recientes',
        sortBy: 'createdAt',
        sortOrder: 'desc'
    },
    {
        label: 'A-Z',
        sortBy: 'title',
        sortOrder: 'asc'
    }
];
function SortSelect({ sortBy, sortOrder, onChange }) {
    const currentValue = OPTIONS.find((o)=>o.sortBy === sortBy && o.sortOrder === sortOrder);
    const currentLabel = currentValue?.label || 'Ordenar por';
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "flex items-center gap-2",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                htmlFor: "sort-select",
                className: "text-sm text-gray-600 dark:text-gray-400 hidden sm:inline",
                children: "Ordenar:"
            }, void 0, false, {
                fileName: "[project]/components/filters/SortSelect.tsx",
                lineNumber: 25,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                id: "sort-select",
                value: `${sortBy}-${sortOrder}`,
                onChange: (e)=>{
                    const [newSortBy, newSortOrder] = e.target.value.split('-');
                    onChange(newSortBy, newSortOrder);
                },
                className: "border rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
                children: OPTIONS.map((opt)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                        value: `${opt.sortBy}-${opt.sortOrder}`,
                        children: opt.label
                    }, `${opt.sortBy}-${opt.sortOrder}`, false, {
                        fileName: "[project]/components/filters/SortSelect.tsx",
                        lineNumber: 38,
                        columnNumber: 11
                    }, this))
            }, void 0, false, {
                fileName: "[project]/components/filters/SortSelect.tsx",
                lineNumber: 28,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/filters/SortSelect.tsx",
        lineNumber: 24,
        columnNumber: 5
    }, this);
}
_c = SortSelect;
var _c;
__turbopack_context__.k.register(_c, "SortSelect");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/filters/ActiveFilters.tsx [client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>ActiveFilters
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react/jsx-dev-runtime.js [client] (ecmascript)");
;
const FILTER_LABELS = {
    category: (v, cats)=>{
        const cat = cats?.find((c)=>c.id === Number(v));
        return cat ? `Categoría: ${cat.name}` : `Categoría: ${v}`;
    },
    search: (v)=>`Buscar: ${v}`,
    datePreset: (v)=>{
        const labels = {
            today: 'Hoy',
            this_week: 'Esta semana',
            this_weekend: 'Este fin de semana',
            upcoming: 'Próximos'
        };
        return labels[String(v)] || String(v);
    },
    minPrice: (v, _c, filters)=>{
        const max = filters?.maxPrice;
        return max != null ? `Precio: ${v}-${max}€` : `Precio: desde ${v}€`;
    },
    maxPrice: (v, _c, filters)=>{
        const min = filters?.minPrice;
        return min != null ? '' : `Precio: hasta ${v}€`;
    },
    minRating: (v)=>`Rating: ≥${v}★`,
    available: ()=>'Con plazas',
    soldOut: ()=>'Agotados',
    isFree: ()=>'Gratuitos',
    sortBy: (v)=>`Orden: ${v}`,
    sortOrder: (v)=>v === 'desc' ? 'Orden: descendente' : ''
};
const FILTER_KEYS = [
    'category',
    'search',
    'datePreset',
    'minPrice',
    'maxPrice',
    'minRating',
    'available',
    'soldOut',
    'isFree',
    'sortBy',
    'sortOrder'
];
function ActiveFilters({ filters, categories, onRemove, onReset, activeCount }) {
    if (activeCount === 0) return null;
    const activeChips = FILTER_KEYS.map((key)=>{
        const value = filters[key];
        if (value == null || value === '' || value === false) return null;
        const labelFn = FILTER_LABELS[key];
        if (!labelFn) return null;
        const label = labelFn(value, categories, filters);
        if (!label) return null;
        return {
            key,
            label
        };
    }).filter(Boolean);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "flex flex-wrap items-center gap-2 mb-4",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: "text-sm text-gray-500 dark:text-gray-400 font-medium",
                children: "Filtros activos:"
            }, void 0, false, {
                fileName: "[project]/components/filters/ActiveFilters.tsx",
                lineNumber: 65,
                columnNumber: 7
            }, this),
            activeChips.map((chip)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                    onClick: ()=>onRemove(chip.key),
                    className: "inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm bg-blue-100 dark:bg-blue-900/30 text-blue-800 hover:bg-blue-200 dark:hover:bg-blue-900/40 transition-colors",
                    "aria-label": `Eliminar filtro: ${chip.label}`,
                    children: [
                        chip.label,
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: "text-blue-500 hover:text-blue-700 font-bold",
                            children: "×"
                        }, void 0, false, {
                            fileName: "[project]/components/filters/ActiveFilters.tsx",
                            lineNumber: 74,
                            columnNumber: 11
                        }, this)
                    ]
                }, chip.key, true, {
                    fileName: "[project]/components/filters/ActiveFilters.tsx",
                    lineNumber: 67,
                    columnNumber: 9
                }, this)),
            activeCount > 1 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                onClick: onReset,
                className: "text-sm text-red-600 dark:text-red-400 hover:text-red-800 underline ml-2",
                children: "Limpiar todo"
            }, void 0, false, {
                fileName: "[project]/components/filters/ActiveFilters.tsx",
                lineNumber: 78,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/filters/ActiveFilters.tsx",
        lineNumber: 64,
        columnNumber: 5
    }, this);
}
_c = ActiveFilters;
var _c;
__turbopack_context__.k.register(_c, "ActiveFilters");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/filters/FilterBar.tsx [client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>FilterBar
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react/jsx-dev-runtime.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react/index.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$useDebounce$2e$ts__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/useDebounce.ts [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$Button$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/ui/Button.tsx [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$filters$2f$DatePresetFilter$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/filters/DatePresetFilter.tsx [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$filters$2f$PriceRangeFilter$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/filters/PriceRangeFilter.tsx [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$filters$2f$RatingFilter$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/filters/RatingFilter.tsx [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$filters$2f$AvailabilityFilter$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/filters/AvailabilityFilter.tsx [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$filters$2f$SortSelect$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/filters/SortSelect.tsx [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$filters$2f$ActiveFilters$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/filters/ActiveFilters.tsx [client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
;
;
;
;
;
;
;
;
;
function FilterBar({ filters, categories, priceMin, priceMax, totalAvailableEvents, totalSoldOutEvents, totalFreeEvents, onSetFilters, onRemoveFilter, onResetFilters, activeFilterCount }) {
    _s();
    const [showMobile, setShowMobile] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [searchInput, setSearchInput] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])(filters.search || '');
    const debouncedSearch = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$useDebounce$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["useDebounce"])(searchInput, 300);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "FilterBar.useEffect": ()=>{
            if (debouncedSearch !== (filters.search || '')) {
                onSetFilters({
                    search: debouncedSearch || undefined
                });
            }
        }
    }["FilterBar.useEffect"], [
        debouncedSearch
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "FilterBar.useEffect": ()=>{
            if (!filters.search) {
                setSearchInput('');
            }
        }
    }["FilterBar.useEffect"], [
        filters.search
    ]);
    const content = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "space-y-4",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                        htmlFor: "search-input",
                        className: "text-sm font-medium text-gray-700 dark:text-gray-300",
                        children: "Buscar eventos"
                    }, void 0, false, {
                        fileName: "[project]/components/filters/FilterBar.tsx",
                        lineNumber: 59,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                        id: "search-input",
                        type: "text",
                        value: searchInput,
                        onChange: (e)=>setSearchInput(e.target.value),
                        placeholder: "Buscar por título, descripción...",
                        className: "mt-1 w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    }, void 0, false, {
                        fileName: "[project]/components/filters/FilterBar.tsx",
                        lineNumber: 62,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/filters/FilterBar.tsx",
                lineNumber: 58,
                columnNumber: 7
            }, this),
            categories && categories.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                        className: "text-sm font-medium text-gray-700 dark:text-gray-300",
                        children: "Categoría"
                    }, void 0, false, {
                        fileName: "[project]/components/filters/FilterBar.tsx",
                        lineNumber: 75,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "mt-1 flex flex-wrap gap-2",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$Button$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["Button"], {
                                variant: !filters.category ? 'primary' : 'secondary',
                                size: "sm",
                                onClick: ()=>onSetFilters({
                                        category: undefined
                                    }),
                                children: "Todas"
                            }, void 0, false, {
                                fileName: "[project]/components/filters/FilterBar.tsx",
                                lineNumber: 77,
                                columnNumber: 13
                            }, this),
                            categories.map((cat)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$Button$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["Button"], {
                                    variant: filters.category === cat.id ? 'primary' : 'secondary',
                                    size: "sm",
                                    onClick: ()=>onSetFilters({
                                            category: cat.id
                                        }),
                                    style: filters.category === cat.id ? {
                                        backgroundColor: cat.color
                                    } : {
                                        borderColor: cat.color
                                    },
                                    children: cat.name
                                }, cat.id, false, {
                                    fileName: "[project]/components/filters/FilterBar.tsx",
                                    lineNumber: 85,
                                    columnNumber: 15
                                }, this))
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/filters/FilterBar.tsx",
                        lineNumber: 76,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/filters/FilterBar.tsx",
                lineNumber: 74,
                columnNumber: 9
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                        className: "text-sm font-medium text-gray-700 dark:text-gray-300",
                        children: "Fecha"
                    }, void 0, false, {
                        fileName: "[project]/components/filters/FilterBar.tsx",
                        lineNumber: 101,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "mt-1",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$filters$2f$DatePresetFilter$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["default"], {
                            value: filters.datePreset,
                            onChange: (preset)=>onSetFilters({
                                    datePreset: preset
                                })
                        }, void 0, false, {
                            fileName: "[project]/components/filters/FilterBar.tsx",
                            lineNumber: 103,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/components/filters/FilterBar.tsx",
                        lineNumber: 102,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/filters/FilterBar.tsx",
                lineNumber: 100,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$filters$2f$PriceRangeFilter$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["default"], {
                minPrice: filters.minPrice,
                maxPrice: filters.maxPrice,
                priceMin: priceMin,
                priceMax: priceMax,
                onChange: (min, max)=>onSetFilters({
                        minPrice: min,
                        maxPrice: max
                    }),
                onFreeToggle: ()=>onSetFilters({
                        isFree: !filters.isFree
                    }),
                isFree: filters.isFree
            }, void 0, false, {
                fileName: "[project]/components/filters/FilterBar.tsx",
                lineNumber: 111,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$filters$2f$RatingFilter$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["default"], {
                value: filters.minRating,
                onChange: (rating)=>onSetFilters({
                        minRating: rating
                    })
            }, void 0, false, {
                fileName: "[project]/components/filters/FilterBar.tsx",
                lineNumber: 122,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$filters$2f$AvailabilityFilter$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["default"], {
                available: filters.available,
                soldOut: filters.soldOut,
                isFree: filters.isFree,
                onChange: (updates)=>onSetFilters(updates),
                totalAvailableEvents: totalAvailableEvents,
                totalSoldOutEvents: totalSoldOutEvents,
                totalFreeEvents: totalFreeEvents
            }, void 0, false, {
                fileName: "[project]/components/filters/FilterBar.tsx",
                lineNumber: 128,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$filters$2f$SortSelect$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["default"], {
                sortBy: filters.sortBy,
                sortOrder: filters.sortOrder,
                onChange: (sortBy, sortOrder)=>onSetFilters({
                        sortBy: sortBy,
                        sortOrder: sortOrder
                    })
            }, void 0, false, {
                fileName: "[project]/components/filters/FilterBar.tsx",
                lineNumber: 139,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/filters/FilterBar.tsx",
        lineNumber: 56,
        columnNumber: 5
    }, this);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["Fragment"], {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "hidden md:block mb-6 p-4 bg-white dark:bg-gray-800 border rounded-lg",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$filters$2f$ActiveFilters$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["default"], {
                        filters: filters,
                        categories: categories,
                        onRemove: onRemoveFilter,
                        onReset: onResetFilters,
                        activeCount: activeFilterCount
                    }, void 0, false, {
                        fileName: "[project]/components/filters/FilterBar.tsx",
                        lineNumber: 153,
                        columnNumber: 9
                    }, this),
                    content
                ]
            }, void 0, true, {
                fileName: "[project]/components/filters/FilterBar.tsx",
                lineNumber: 152,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "md:hidden mb-4",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$filters$2f$ActiveFilters$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["default"], {
                        filters: filters,
                        categories: categories,
                        onRemove: onRemoveFilter,
                        onReset: onResetFilters,
                        activeCount: activeFilterCount
                    }, void 0, false, {
                        fileName: "[project]/components/filters/FilterBar.tsx",
                        lineNumber: 165,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$Button$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["Button"], {
                        variant: "secondary",
                        onClick: ()=>setShowMobile(true),
                        className: "w-full",
                        children: [
                            "Filtros ",
                            activeFilterCount > 0 && `(${activeFilterCount})`
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/filters/FilterBar.tsx",
                        lineNumber: 172,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/filters/FilterBar.tsx",
                lineNumber: 164,
                columnNumber: 7
            }, this),
            showMobile && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "fixed inset-0 z-50 md:hidden",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "absolute inset-0 bg-black bg-opacity-50",
                        onClick: ()=>setShowMobile(false)
                    }, void 0, false, {
                        fileName: "[project]/components/filters/FilterBar.tsx",
                        lineNumber: 184,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "absolute left-0 top-0 bottom-0 w-80 max-w-[85vw] bg-white dark:bg-gray-800 p-4 overflow-y-auto shadow-xl",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center justify-between mb-4",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                        className: "text-lg font-semibold",
                                        children: "Filtros"
                                    }, void 0, false, {
                                        fileName: "[project]/components/filters/FilterBar.tsx",
                                        lineNumber: 190,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: ()=>setShowMobile(false),
                                        className: "text-gray-500 dark:text-gray-400 hover:text-gray-700 text-xl",
                                        "aria-label": "Cerrar filtros",
                                        children: "×"
                                    }, void 0, false, {
                                        fileName: "[project]/components/filters/FilterBar.tsx",
                                        lineNumber: 191,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/filters/FilterBar.tsx",
                                lineNumber: 189,
                                columnNumber: 13
                            }, this),
                            content,
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "mt-6 flex gap-2",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$Button$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["Button"], {
                                        variant: "primary",
                                        onClick: ()=>setShowMobile(false),
                                        className: "flex-1",
                                        children: "Aplicar filtros"
                                    }, void 0, false, {
                                        fileName: "[project]/components/filters/FilterBar.tsx",
                                        lineNumber: 201,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$Button$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["Button"], {
                                        variant: "secondary",
                                        onClick: ()=>{
                                            onResetFilters();
                                            setShowMobile(false);
                                        },
                                        className: "flex-1",
                                        children: "Limpiar"
                                    }, void 0, false, {
                                        fileName: "[project]/components/filters/FilterBar.tsx",
                                        lineNumber: 204,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/filters/FilterBar.tsx",
                                lineNumber: 200,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/filters/FilterBar.tsx",
                        lineNumber: 188,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/filters/FilterBar.tsx",
                lineNumber: 183,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true);
}
_s(FilterBar, "s9R5b04Qh2rGvqI6qevwp2xSuCk=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$useDebounce$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["useDebounce"]
    ];
});
_c = FilterBar;
var _c;
__turbopack_context__.k.register(_c, "FilterBar");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/filters/Pagination.tsx [client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>Pagination
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react/jsx-dev-runtime.js [client] (ecmascript)");
;
function getPageNumbers(current, total) {
    if (total <= 7) {
        return Array.from({
            length: total
        }, (_, i)=>i + 1);
    }
    if (current <= 3) {
        return [
            1,
            2,
            3,
            4,
            '...',
            total
        ];
    }
    if (current >= total - 2) {
        return [
            1,
            '...',
            total - 3,
            total - 2,
            total - 1,
            total
        ];
    }
    return [
        1,
        '...',
        current - 1,
        current,
        current + 1,
        '...',
        total
    ];
}
function Pagination({ page, pages, total, limit, hasNext, hasPrev, onPageChange }) {
    if (pages <= 1) return null;
    const startItem = (page - 1) * limit + 1;
    const endItem = Math.min(page * limit, total);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "flex flex-col sm:flex-row items-center justify-between gap-4 mt-8",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "text-sm text-gray-600 dark:text-gray-400",
                children: [
                    "Mostrando ",
                    startItem,
                    "-",
                    endItem,
                    " de ",
                    total,
                    " eventos"
                ]
            }, void 0, true, {
                fileName: "[project]/components/filters/Pagination.tsx",
                lineNumber: 45,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("nav", {
                className: "flex items-center gap-1",
                "aria-label": "Paginación",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: ()=>onPageChange(page - 1),
                        disabled: !hasPrev,
                        className: "px-3 py-1.5 text-sm border rounded hover:bg-blue-50 dark:hover:bg-blue-900/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors",
                        "aria-label": "Página anterior",
                        children: "Anterior"
                    }, void 0, false, {
                        fileName: "[project]/components/filters/Pagination.tsx",
                        lineNumber: 50,
                        columnNumber: 9
                    }, this),
                    getPageNumbers(page, pages).map((item, i)=>typeof item === 'string' ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: "px-2 text-gray-400 dark:text-gray-500",
                            children: "..."
                        }, `ellipsis-${i}`, false, {
                            fileName: "[project]/components/filters/Pagination.tsx",
                            lineNumber: 61,
                            columnNumber: 13
                        }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            onClick: ()=>onPageChange(item),
                            className: `px-3 py-1.5 text-sm border rounded transition-colors ${item === page ? 'bg-blue-600 text-white border-blue-600' : 'hover:bg-blue-50 dark:hover:bg-blue-900/30'}`,
                            "aria-label": `Página ${item}`,
                            "aria-current": item === page ? 'page' : undefined,
                            children: item
                        }, item, false, {
                            fileName: "[project]/components/filters/Pagination.tsx",
                            lineNumber: 63,
                            columnNumber: 13
                        }, this)),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: ()=>onPageChange(page + 1),
                        disabled: !hasNext,
                        className: "px-3 py-1.5 text-sm border rounded hover:bg-blue-50 dark:hover:bg-blue-900/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors",
                        "aria-label": "Página siguiente",
                        children: "Siguiente"
                    }, void 0, false, {
                        fileName: "[project]/components/filters/Pagination.tsx",
                        lineNumber: 79,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/filters/Pagination.tsx",
                lineNumber: 49,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/filters/Pagination.tsx",
        lineNumber: 44,
        columnNumber: 5
    }, this);
}
_c = Pagination;
var _c;
__turbopack_context__.k.register(_c, "Pagination");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/filters/SkeletonLoader.tsx [client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>SkeletonLoader
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react/jsx-dev-runtime.js [client] (ecmascript)");
;
function SkeletonLoader({ count = 12 }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6",
        children: Array.from({
            length: count
        }).map((_, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden animate-pulse",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "h-48 bg-gray-200 dark:bg-gray-700"
                    }, void 0, false, {
                        fileName: "[project]/components/filters/SkeletonLoader.tsx",
                        lineNumber: 12,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "p-4 space-y-3",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex justify-between",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "h-5 w-20 bg-gray-200 dark:bg-gray-700 rounded"
                                    }, void 0, false, {
                                        fileName: "[project]/components/filters/SkeletonLoader.tsx",
                                        lineNumber: 15,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "h-5 w-24 bg-gray-200 dark:bg-gray-700 rounded"
                                    }, void 0, false, {
                                        fileName: "[project]/components/filters/SkeletonLoader.tsx",
                                        lineNumber: 16,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/filters/SkeletonLoader.tsx",
                                lineNumber: 14,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "h-6 w-3/4 bg-gray-200 dark:bg-gray-700 rounded"
                            }, void 0, false, {
                                fileName: "[project]/components/filters/SkeletonLoader.tsx",
                                lineNumber: 18,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "h-4 w-1/2 bg-gray-200 dark:bg-gray-700 rounded"
                            }, void 0, false, {
                                fileName: "[project]/components/filters/SkeletonLoader.tsx",
                                lineNumber: 19,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "h-4 w-2/3 bg-gray-200 dark:bg-gray-700 rounded"
                            }, void 0, false, {
                                fileName: "[project]/components/filters/SkeletonLoader.tsx",
                                lineNumber: 20,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex justify-between pt-2",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded"
                                    }, void 0, false, {
                                        fileName: "[project]/components/filters/SkeletonLoader.tsx",
                                        lineNumber: 22,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded"
                                    }, void 0, false, {
                                        fileName: "[project]/components/filters/SkeletonLoader.tsx",
                                        lineNumber: 23,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/filters/SkeletonLoader.tsx",
                                lineNumber: 21,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/filters/SkeletonLoader.tsx",
                        lineNumber: 13,
                        columnNumber: 11
                    }, this)
                ]
            }, i, true, {
                fileName: "[project]/components/filters/SkeletonLoader.tsx",
                lineNumber: 11,
                columnNumber: 9
            }, this))
    }, void 0, false, {
        fileName: "[project]/components/filters/SkeletonLoader.tsx",
        lineNumber: 9,
        columnNumber: 5
    }, this);
}
_c = SkeletonLoader;
var _c;
__turbopack_context__.k.register(_c, "SkeletonLoader");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/lib/useFavorites.ts [client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "useFavorites",
    ()=>useFavorites
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/node_modules/next/dist/build/polyfills/process.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react/index.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$auth$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/auth.tsx [client] (ecmascript)");
var _s = __turbopack_context__.k.signature();
;
;
function useFavorites() {
    _s();
    const { token } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$auth$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["useAuth"])();
    const getApiUrl = ()=>{
        if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
        ;
        const hostname = window.location.hostname;
        const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1';
        const isProduction = hostname === 'eventoscordoba.xyz';
        if (isLocalhost) {
            return 'http://localhost:3001';
        }
        if (isProduction) {
            return 'https://api.eventoscordoba.xyz';
        }
        if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
        ;
        return 'https://api.eventoscordoba.xyz';
    };
    const toggleFavorite = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "useFavorites.useCallback[toggleFavorite]": async (eventId, wasFavorited)=>{
            if (!token) return false;
            try {
                const apiUrl = getApiUrl();
                const url = wasFavorited ? `${apiUrl}/api/favorites/${eventId}` : `${apiUrl}/api/favorites`;
                const response = await fetch(url, {
                    method: wasFavorited ? 'DELETE' : 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`
                    },
                    ...wasFavorited ? {} : {
                        body: JSON.stringify({
                            eventId
                        })
                    }
                });
                return response.ok;
            } catch (error) {
                console.error('Toggle favorite error:', error);
                return false;
            }
        }
    }["useFavorites.useCallback[toggleFavorite]"], [
        token
    ]);
    return {
        toggleFavorite
    };
}
_s(useFavorites, "FUQBQuGTBWmSeJ2ZKbrxkFRFOoI=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$auth$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["useAuth"]
    ];
});
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/FavoriteButton.tsx [client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "FavoriteButton",
    ()=>FavoriteButton
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react/jsx-dev-runtime.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react/index.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$auth$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/auth.tsx [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$useFavorites$2e$ts__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/useFavorites.ts [client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
;
;
;
const FavoriteButton = ({ eventId, initialFavorited = false, size = 'md', showLabel = false, className = '', onToggle })=>{
    _s();
    const { user } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$auth$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["useAuth"])();
    const { toggleFavorite } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$useFavorites$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["useFavorites"])();
    const [isFavorited, setIsFavorited] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])(initialFavorited);
    const [isLoading, setIsLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const handleActivate = async (e)=>{
        e.preventDefault();
        e.stopPropagation();
        if (!user) {
            window.location.href = '/login';
            return;
        }
        setIsLoading(true);
        const previousState = isFavorited;
        setIsFavorited(!isFavorited);
        const success = await toggleFavorite(eventId, previousState);
        if (!success) {
            setIsFavorited(previousState);
        } else if (onToggle) {
            onToggle(eventId, !previousState);
        }
        setIsLoading(false);
    };
    const handleClick = async (e)=>{
        e.preventDefault();
        e.stopPropagation();
        e.nativeEvent.stopImmediatePropagation();
        await handleActivate(e);
    };
    const handleKeyDown = async (e)=>{
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            e.stopPropagation();
            e.nativeEvent.stopImmediatePropagation();
            await handleActivate(e);
        }
    };
    const sizeClasses = {
        sm: 'text-lg',
        md: 'text-2xl',
        lg: 'text-3xl'
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
        onClick: handleClick,
        onKeyDown: handleKeyDown,
        role: "button",
        tabIndex: 0,
        "aria-disabled": isLoading,
        className: `inline-flex items-center gap-1 transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2 rounded-full p-1 cursor-pointer ${isFavorited ? 'text-red-500' : 'text-gray-400 dark:text-gray-500 hover:text-red-400'} ${isLoading ? 'opacity-50 cursor-not-allowed' : ''} ${sizeClasses[size]} ${className}`,
        "aria-label": isFavorited ? 'Quitar de favoritos' : 'Añadir a favoritos',
        title: isFavorited ? 'Quitar de favoritos' : 'Añadir a favoritos',
        children: [
            isFavorited ? '❤️' : '🤍',
            showLabel && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: `text-sm ${isFavorited ? 'text-red-500' : 'text-gray-500 dark:text-gray-400'}`,
                children: isFavorited ? 'En favoritos' : 'Añadir a favoritos'
            }, void 0, false, {
                fileName: "[project]/components/FavoriteButton.tsx",
                lineNumber: 82,
                columnNumber: 9
            }, ("TURBOPACK compile-time value", void 0))
        ]
    }, void 0, true, {
        fileName: "[project]/components/FavoriteButton.tsx",
        lineNumber: 68,
        columnNumber: 5
    }, ("TURBOPACK compile-time value", void 0));
};
_s(FavoriteButton, "QxZbtaJ4qW/WnQyg733Kq/ccIB0=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$auth$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["useAuth"],
        __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$useFavorites$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["useFavorites"]
    ];
});
_c = FavoriteButton;
var _c;
__turbopack_context__.k.register(_c, "FavoriteButton");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/lib/imageUtils.ts [client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getImageUrl",
    ()=>getImageUrl
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/node_modules/next/dist/build/polyfills/process.js [client] (ecmascript)");
function getApiBaseUrl() {
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    const hostname = window.location.hostname;
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
        return 'http://localhost:3001';
    }
    if (hostname === 'eventoscordoba.xyz') {
        return 'https://api.eventoscordoba.xyz';
    }
    return ("TURBOPACK compile-time value", "") || 'https://api.eventoscordoba.xyz';
}
function getImageUrl(imageUrl) {
    if (!imageUrl) return null;
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
        return imageUrl;
    }
    const apiBaseUrl = getApiBaseUrl();
    return `${apiBaseUrl}${imageUrl}`;
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/EventCard.tsx [client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>EventCard
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react/jsx-dev-runtime.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$link$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/link.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$FavoriteButton$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/FavoriteButton.tsx [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$imageUtils$2e$ts__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/imageUtils.ts [client] (ecmascript)");
;
;
;
;
function formatDate(dateString) {
    if (!dateString) return 'Fecha no disponible';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Fecha inválida';
    return date.toLocaleDateString('es-ES', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}
function formatPrice(price) {
    const numericPrice = Number(price);
    if (isNaN(numericPrice)) return 'Precio no disponible';
    if (numericPrice === 0) return 'Gratis';
    return `${numericPrice.toFixed(2)}€`;
}
function EventCard({ event, onFavoriteToggle }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "relative bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md dark:hover:shadow-gray-900/25 transition-shadow",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$link$2e$js__$5b$client$5d$__$28$ecmascript$29$__["default"], {
                href: `/events/${event.id}`,
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "h-48 bg-gray-200 dark:bg-gray-700 flex items-center justify-center",
                        children: event.imageUrl ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                            src: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$imageUtils$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["getImageUrl"])(event.imageUrl) || '',
                            alt: event.title,
                            className: "w-full h-full object-cover",
                            loading: "lazy",
                            onError: (e)=>{
                                e.currentTarget.src = '/placeholder-event.jpg';
                            }
                        }, void 0, false, {
                            fileName: "[project]/components/EventCard.tsx",
                            lineNumber: 39,
                            columnNumber: 13
                        }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "text-gray-400 dark:text-gray-500 text-center",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "text-4xl mb-2",
                                    "aria-hidden": "true",
                                    children: "📅"
                                }, void 0, false, {
                                    fileName: "[project]/components/EventCard.tsx",
                                    lineNumber: 48,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "text-sm",
                                    children: "Sin imagen"
                                }, void 0, false, {
                                    fileName: "[project]/components/EventCard.tsx",
                                    lineNumber: 49,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/EventCard.tsx",
                            lineNumber: 47,
                            columnNumber: 13
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/components/EventCard.tsx",
                        lineNumber: 37,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "p-4",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center justify-between mb-2",
                                children: [
                                    event.category ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-white",
                                        style: {
                                            backgroundColor: event.category.color
                                        },
                                        children: event.category.name
                                    }, void 0, false, {
                                        fileName: "[project]/components/EventCard.tsx",
                                        lineNumber: 57,
                                        columnNumber: 15
                                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-xs text-gray-400 dark:text-gray-500",
                                        children: "Sin categoría"
                                    }, void 0, false, {
                                        fileName: "[project]/components/EventCard.tsx",
                                        lineNumber: 64,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-sm text-gray-500 dark:text-gray-400",
                                        children: [
                                            Math.max(0, event.availableSpots || 0),
                                            " plazas libres"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/EventCard.tsx",
                                        lineNumber: 66,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/EventCard.tsx",
                                lineNumber: 55,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                className: "text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1 line-clamp-2",
                                children: event.title
                            }, void 0, false, {
                                fileName: "[project]/components/EventCard.tsx",
                                lineNumber: 71,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "text-sm text-gray-600 dark:text-gray-400 mb-2",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex items-center mb-1",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "mr-2",
                                                "aria-hidden": "true",
                                                children: "📅"
                                            }, void 0, false, {
                                                fileName: "[project]/components/EventCard.tsx",
                                                lineNumber: 77,
                                                columnNumber: 15
                                            }, this),
                                            formatDate(event.date)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/EventCard.tsx",
                                        lineNumber: 76,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex items-center",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "mr-2",
                                                "aria-hidden": "true",
                                                children: "📍"
                                            }, void 0, false, {
                                                fileName: "[project]/components/EventCard.tsx",
                                                lineNumber: 81,
                                                columnNumber: 15
                                            }, this),
                                            event.location
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/EventCard.tsx",
                                        lineNumber: 80,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/EventCard.tsx",
                                lineNumber: 75,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center justify-between text-sm",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-gray-500 dark:text-gray-400",
                                        children: [
                                            "Por ",
                                            event.organizer?.name || 'Organizador desconocido'
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/EventCard.tsx",
                                        lineNumber: 87,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "font-semibold text-green-600 dark:text-green-400",
                                        children: formatPrice(event.price)
                                    }, void 0, false, {
                                        fileName: "[project]/components/EventCard.tsx",
                                        lineNumber: 90,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/EventCard.tsx",
                                lineNumber: 86,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/EventCard.tsx",
                        lineNumber: 54,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/EventCard.tsx",
                lineNumber: 36,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "absolute top-2 right-2 z-10",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex items-center gap-1 bg-white/80 dark:bg-gray-800/80 rounded-full px-1",
                    children: [
                        event.favoriteCount !== undefined && event.favoriteCount > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: "text-xs text-red-400 font-medium",
                            title: "Favoritos",
                            children: event.favoriteCount
                        }, void 0, false, {
                            fileName: "[project]/components/EventCard.tsx",
                            lineNumber: 100,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$FavoriteButton$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["FavoriteButton"], {
                            eventId: event.id,
                            initialFavorited: event.isFavorited || false,
                            size: "sm",
                            onToggle: onFavoriteToggle
                        }, void 0, false, {
                            fileName: "[project]/components/EventCard.tsx",
                            lineNumber: 104,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/components/EventCard.tsx",
                    lineNumber: 98,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/components/EventCard.tsx",
                lineNumber: 97,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/EventCard.tsx",
        lineNumber: 35,
        columnNumber: 5
    }, this);
}
_c = EventCard;
var _c;
__turbopack_context__.k.register(_c, "EventCard");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/pages/events.tsx [client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>Events
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react/jsx-dev-runtime.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react/index.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$Layout$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/Layout.tsx [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$auth$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/auth.tsx [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$useEventFilters$2e$ts__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/useEventFilters.ts [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$queries$2f$useEvents$2e$ts__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/queries/useEvents.ts [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$filters$2f$FilterBar$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/filters/FilterBar.tsx [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$filters$2f$Pagination$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/filters/Pagination.tsx [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$filters$2f$SkeletonLoader$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/filters/SkeletonLoader.tsx [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$EventCard$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/EventCard.tsx [client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
;
;
;
;
;
;
;
;
;
function Events() {
    _s();
    const { token } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$auth$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["useAuth"])();
    const { filters, setFilters, removeFilter, resetFilters, activeFilterCount } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$useEventFilters$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["useEventFilters"])();
    const { data: response, isLoading, isFetching, error } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$queries$2f$useEvents$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["useEvents"])(filters, token ?? undefined);
    const { data: metaResponse } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$queries$2f$useEvents$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["useFiltersMeta"])();
    const events = response?.data ?? [];
    const pagination = response?.pagination;
    const meta = metaResponse?.data;
    const [favoriteUpdates, setFavoriteUpdates] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])({});
    const handleFavoriteToggle = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "Events.useCallback[handleFavoriteToggle]": (eventId, nowFavorited)=>{
            setFavoriteUpdates({
                "Events.useCallback[handleFavoriteToggle]": (prev)=>{
                    const event = events.find({
                        "Events.useCallback[handleFavoriteToggle].event": (e)=>e.id === eventId
                    }["Events.useCallback[handleFavoriteToggle].event"]);
                    const currentCount = favoriteUpdates[eventId]?.favoriteCount ?? event?.favoriteCount ?? 0;
                    return {
                        ...prev,
                        [eventId]: {
                            isFavorited: nowFavorited,
                            favoriteCount: nowFavorited ? currentCount + 1 : Math.max(0, currentCount - 1)
                        }
                    };
                }
            }["Events.useCallback[handleFavoriteToggle]"]);
        }
    }["Events.useCallback[handleFavoriteToggle]"], [
        events,
        favoriteUpdates
    ]);
    const getEventWithFavorites = (event)=>{
        const update = favoriteUpdates[event.id];
        if (update) {
            return {
                ...event,
                ...update
            };
        }
        return event;
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$Layout$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["Layout"], {
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "px-4 sm:px-6 lg:px-8",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "sm:flex sm:items-center sm:justify-between",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                                className: "text-2xl font-bold text-gray-900 dark:text-gray-100",
                                children: "Eventos"
                            }, void 0, false, {
                                fileName: "[project]/pages/events.tsx",
                                lineNumber: 52,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "mt-2 text-sm text-gray-700 dark:text-gray-300",
                                children: "Descubre todos los eventos disponibles en Córdoba"
                            }, void 0, false, {
                                fileName: "[project]/pages/events.tsx",
                                lineNumber: 53,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/pages/events.tsx",
                        lineNumber: 51,
                        columnNumber: 11
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/pages/events.tsx",
                    lineNumber: 50,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "mt-6 md:grid md:grid-cols-[280px_1fr] lg:grid-cols-[320px_1fr] md:gap-6",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("aside", {
                            className: "md:sticky md:top-4 md:self-start",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$filters$2f$FilterBar$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["default"], {
                                filters: filters,
                                categories: meta?.categories,
                                priceMin: meta?.priceRange.min ?? 0,
                                priceMax: meta?.priceRange.max ?? 0,
                                totalAvailableEvents: meta?.totalAvailableEvents,
                                totalSoldOutEvents: meta?.totalSoldOutEvents,
                                totalFreeEvents: meta?.totalFreeEvents,
                                onSetFilters: setFilters,
                                onRemoveFilter: removeFilter,
                                onResetFilters: resetFilters,
                                activeFilterCount: activeFilterCount
                            }, void 0, false, {
                                fileName: "[project]/pages/events.tsx",
                                lineNumber: 63,
                                columnNumber: 13
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/pages/events.tsx",
                            lineNumber: 62,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "min-w-0",
                            children: [
                                error && !isLoading && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "text-center py-12",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "text-red-500 text-lg mb-2",
                                            children: "Error al cargar eventos"
                                        }, void 0, false, {
                                            fileName: "[project]/pages/events.tsx",
                                            lineNumber: 83,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            onClick: ()=>window.location.reload(),
                                            className: "text-blue-600 dark:text-blue-400 hover:underline text-sm",
                                            children: "Reintentar"
                                        }, void 0, false, {
                                            fileName: "[project]/pages/events.tsx",
                                            lineNumber: 86,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/pages/events.tsx",
                                    lineNumber: 82,
                                    columnNumber: 15
                                }, this),
                                (isLoading || isFetching) && !error && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$filters$2f$SkeletonLoader$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["default"], {
                                    count: filters.limit
                                }, void 0, false, {
                                    fileName: "[project]/pages/events.tsx",
                                    lineNumber: 97,
                                    columnNumber: 15
                                }, this),
                                !isLoading && !isFetching && !error && events.length === 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "text-center py-12",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "text-gray-500 dark:text-gray-400 text-lg",
                                            children: "No se encontraron eventos con estos filtros"
                                        }, void 0, false, {
                                            fileName: "[project]/pages/events.tsx",
                                            lineNumber: 103,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "text-gray-400 dark:text-gray-500 text-sm mt-2",
                                            children: activeFilterCount > 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                onClick: resetFilters,
                                                className: "text-blue-600 dark:text-blue-400 hover:underline",
                                                children: "Limpiar filtros"
                                            }, void 0, false, {
                                                fileName: "[project]/pages/events.tsx",
                                                lineNumber: 108,
                                                columnNumber: 21
                                            }, this) : 'No hay eventos disponibles actualmente'
                                        }, void 0, false, {
                                            fileName: "[project]/pages/events.tsx",
                                            lineNumber: 106,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/pages/events.tsx",
                                    lineNumber: 102,
                                    columnNumber: 15
                                }, this),
                                !isLoading && !error && events.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["Fragment"], {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6",
                                            children: events.map((event)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$EventCard$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["default"], {
                                                    event: getEventWithFavorites(event),
                                                    onFavoriteToggle: handleFavoriteToggle
                                                }, event.id, false, {
                                                    fileName: "[project]/pages/events.tsx",
                                                    lineNumber: 126,
                                                    columnNumber: 21
                                                }, this))
                                        }, void 0, false, {
                                            fileName: "[project]/pages/events.tsx",
                                            lineNumber: 124,
                                            columnNumber: 17
                                        }, this),
                                        pagination && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$filters$2f$Pagination$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["default"], {
                                            page: pagination.page,
                                            pages: pagination.pages,
                                            total: pagination.total,
                                            limit: pagination.limit,
                                            hasNext: pagination.hasNext,
                                            hasPrev: pagination.hasPrev,
                                            onPageChange: (page)=>{
                                                setFilters({
                                                    page
                                                });
                                                window.scrollTo({
                                                    top: 0,
                                                    behavior: 'smooth'
                                                });
                                            }
                                        }, void 0, false, {
                                            fileName: "[project]/pages/events.tsx",
                                            lineNumber: 136,
                                            columnNumber: 19
                                        }, this)
                                    ]
                                }, void 0, true)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/pages/events.tsx",
                            lineNumber: 79,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/pages/events.tsx",
                    lineNumber: 60,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/pages/events.tsx",
            lineNumber: 48,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/pages/events.tsx",
        lineNumber: 47,
        columnNumber: 5
    }, this);
}
_s(Events, "88r2dC8xPG9lrGpToDK+o9MstNE=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$auth$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["useAuth"],
        __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$useEventFilters$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["useEventFilters"],
        __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$queries$2f$useEvents$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["useEvents"],
        __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$queries$2f$useEvents$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["useFiltersMeta"]
    ];
});
_c = Events;
var _c;
__turbopack_context__.k.register(_c, "Events");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[next]/entry/page-loader.ts { PAGE => \"[project]/pages/events.tsx [client] (ecmascript)\" } [client] (ecmascript)", ((__turbopack_context__, module, exports) => {

const PAGE_PATH = "/events";
(window.__NEXT_P = window.__NEXT_P || []).push([
    PAGE_PATH,
    ()=>{
        return __turbopack_context__.r("[project]/pages/events.tsx [client] (ecmascript)");
    }
]);
// @ts-expect-error module.hot exists
if ("TURBOPACK compile-time truthy", 1) {
    // @ts-expect-error module.hot exists
    module.hot.dispose(function() {
        window.__NEXT_P.push([
            PAGE_PATH
        ]);
    });
}
}),
"[hmr-entry]/hmr-entry.js { ENTRY => \"[project]/pages/events\" }", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.r("[next]/entry/page-loader.ts { PAGE => \"[project]/pages/events.tsx [client] (ecmascript)\" } [client] (ecmascript)");
}),
]);

//# sourceMappingURL=%5Broot-of-the-server%5D__0db.xk5._.js.map