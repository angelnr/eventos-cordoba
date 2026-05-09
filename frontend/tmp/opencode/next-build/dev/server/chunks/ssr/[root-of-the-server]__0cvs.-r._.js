module.exports = [
"[project]/lib/queryClient.ts [ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "queryClient",
    ()=>queryClient
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f40$tanstack$2f$react$2d$query__$5b$external$5d$__$2840$tanstack$2f$react$2d$query$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$29$__ = __turbopack_context__.i("[externals]/@tanstack/react-query [external] (@tanstack/react-query, esm_import, [project]/node_modules/@tanstack/react-query)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$externals$5d2f40$tanstack$2f$react$2d$query__$5b$external$5d$__$2840$tanstack$2f$react$2d$query$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$29$__
]);
[__TURBOPACK__imported__module__$5b$externals$5d2f40$tanstack$2f$react$2d$query__$5b$external$5d$__$2840$tanstack$2f$react$2d$query$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
const queryClient = new __TURBOPACK__imported__module__$5b$externals$5d2f40$tanstack$2f$react$2d$query__$5b$external$5d$__$2840$tanstack$2f$react$2d$query$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$29$__["QueryClient"]({
    defaultOptions: {
        queries: {
            refetchOnWindowFocus: false,
            retry: 1,
            staleTime: 30_000,
            gcTime: 300_000
        }
    }
});
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/lib/auth.tsx [ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "AuthProvider",
    ()=>AuthProvider,
    "useAuth",
    ()=>useAuth
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/react/jsx-dev-runtime [external] (react/jsx-dev-runtime, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/react [external] (react, cjs)");
;
;
const AuthContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["createContext"])(undefined);
const useAuth = ()=>{
    const context = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useContext"])(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
const AuthProvider = ({ children })=>{
    const [user, setUser] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])(null);
    const [token, setToken] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])(null);
    const [isLoading, setIsLoading] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])(false);
    const [isInitializing, setIsInitializing] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])(true); // 🆕 Estado de inicialización
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])(null);
    // Determinar la URL del API según el entorno
    const getApiUrl = ()=>{
        // Solo ejecutar en el cliente
        if ("TURBOPACK compile-time truthy", 1) {
            return 'http://localhost:3001'; // Fallback para SSR
        }
        //TURBOPACK unreachable
        ;
        const hostname = undefined;
        const isLocalhost = undefined;
        const isProduction = undefined;
    };
    // Verificar token al cargar la aplicación
    (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useEffect"])(()=>{
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
    }, []);
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
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(AuthContext.Provider, {
        value: value,
        children: children
    }, void 0, false, {
        fileName: "[project]/lib/auth.tsx",
        lineNumber: 233,
        columnNumber: 10
    }, ("TURBOPACK compile-time value", void 0));
};
}),
"[project]/lib/theme.tsx [ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ThemeProvider",
    ()=>ThemeProvider,
    "useTheme",
    ()=>useTheme
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/react/jsx-dev-runtime [external] (react/jsx-dev-runtime, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/react [external] (react, cjs)");
;
;
const ThemeContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["createContext"])(undefined);
const STORAGE_KEY = 'themePreference';
const VALID_THEMES = [
    'light',
    'dark',
    'system'
];
function getSystemTheme() {
    if ("TURBOPACK compile-time truthy", 1) return 'light';
    //TURBOPACK unreachable
    ;
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
    if ("TURBOPACK compile-time truthy", 1) return 'system';
    //TURBOPACK unreachable
    ;
}
function ThemeProvider({ children }) {
    const [theme, setThemeState] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])('system');
    const [mounted, setMounted] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])(false);
    (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useEffect"])(()=>{
        setThemeState(readStoredTheme());
        setMounted(true);
    }, []);
    const resolvedTheme = resolveTheme(theme);
    const setTheme = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useCallback"])((newTheme)=>{
        setThemeState(newTheme);
        try {
            localStorage.setItem(STORAGE_KEY, newTheme);
        } catch  {
        // localStorage unavailable
        }
    }, []);
    const toggleTheme = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useCallback"])(()=>{
        setThemeState((prev)=>{
            const current = resolveTheme(prev);
            const next = current === 'dark' ? 'light' : 'dark';
            try {
                localStorage.setItem(STORAGE_KEY, next);
            } catch  {
            // localStorage unavailable
            }
            return next;
        });
    }, []);
    (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useEffect"])(()=>{
        if (!mounted) return;
        applyThemeToDOM(resolvedTheme);
    }, [
        resolvedTheme,
        mounted
    ]);
    (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useEffect"])(()=>{
        if (theme !== 'system') return;
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handler = ()=>{
            applyThemeToDOM(getSystemTheme());
        };
        mediaQuery.addEventListener('change', handler);
        return ()=>mediaQuery.removeEventListener('change', handler);
    }, [
        theme
    ]);
    (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useEffect"])(()=>{
        const handler = (e)=>{
            if (e.key !== STORAGE_KEY) return;
            const newValue = e.newValue;
            if (newValue && VALID_THEMES.includes(newValue)) {
                setThemeState(newValue);
            } else if (e.newValue === null) {
                setThemeState('system');
            }
        };
        window.addEventListener('storage', handler);
        return ()=>window.removeEventListener('storage', handler);
    }, []);
    if (!mounted) {
        return null;
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(ThemeContext.Provider, {
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
function useTheme() {
    const context = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useContext"])(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
}
}),
"[project]/components/ui/ToastProvider.tsx [ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ToastProvider",
    ()=>ToastProvider
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/react/jsx-dev-runtime [external] (react/jsx-dev-runtime, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dynamic$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dynamic.js [ssr] (ecmascript)");
;
;
;
const ToastContainer = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dynamic$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__["default"])(()=>__turbopack_context__.A("[project]/components/ui/ToastContainer.tsx [ssr] (ecmascript, next/dynamic entry, async loader)"), {
    loadableGenerated: {
        modules: [
            "[project]/components/ui/ToastContainer.tsx [client] (ecmascript, next/dynamic entry)"
        ]
    },
    ssr: false
});
function ToastProvider({ children }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["Fragment"], {
        children: [
            children,
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(ToastContainer, {}, void 0, false, {
                fileName: "[project]/components/ui/ToastProvider.tsx",
                lineNumber: 13,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true);
}
}),
"[project]/pages/_app.js [ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "default",
    ()=>MyApp
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/react/jsx-dev-runtime [external] (react/jsx-dev-runtime, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f40$tanstack$2f$react$2d$query__$5b$external$5d$__$2840$tanstack$2f$react$2d$query$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$29$__ = __turbopack_context__.i("[externals]/@tanstack/react-query [external] (@tanstack/react-query, esm_import, [project]/node_modules/@tanstack/react-query)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$queryClient$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/queryClient.ts [ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$auth$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/auth.tsx [ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$theme$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/theme.tsx [ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$ToastProvider$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/ui/ToastProvider.tsx [ssr] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$externals$5d2f40$tanstack$2f$react$2d$query__$5b$external$5d$__$2840$tanstack$2f$react$2d$query$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$queryClient$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$externals$5d2f40$tanstack$2f$react$2d$query__$5b$external$5d$__$2840$tanstack$2f$react$2d$query$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$queryClient$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
;
;
;
;
function MyApp({ Component, pageProps }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$externals$5d2f40$tanstack$2f$react$2d$query__$5b$external$5d$__$2840$tanstack$2f$react$2d$query$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$29$__["QueryClientProvider"], {
        client: __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$queryClient$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__["queryClient"],
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$auth$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__["AuthProvider"], {
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$theme$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__["ThemeProvider"], {
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$ToastProvider$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__["ToastProvider"], {
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(Component, {
                        ...pageProps
                    }, void 0, false, {
                        fileName: "[project]/pages/_app.js",
                        lineNumber: 14,
                        columnNumber: 13
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/pages/_app.js",
                    lineNumber: 13,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/pages/_app.js",
                lineNumber: 12,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "[project]/pages/_app.js",
            lineNumber: 11,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/pages/_app.js",
        lineNumber: 10,
        columnNumber: 5
    }, this);
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[externals]/@tanstack/react-query [external] (@tanstack/react-query, esm_import, [project]/node_modules/@tanstack/react-query)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

const mod = await __turbopack_context__.y("@tanstack/react-query-a07b84a9a4b6bf2a");

__turbopack_context__.n(mod);
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, true);}),
"[project]/node_modules/next/dist/server/route-modules/pages/vendored/contexts/loadable.js [ssr] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

module.exports = __turbopack_context__.r("[project]/node_modules/next/dist/server/route-modules/pages/module.compiled.js [ssr] (ecmascript)").vendored['contexts'].Loadable;
}),
"[project]/node_modules/next/dist/shared/lib/dynamic.js [ssr] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
0 && (module.exports = {
    default: null,
    noSSR: null
});
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
    });
}
_export(exports, {
    /**
 * This function lets you dynamically import a component.
 * It uses [React.lazy()](https://react.dev/reference/react/lazy) with [Suspense](https://react.dev/reference/react/Suspense) under the hood.
 *
 * Read more: [Next.js Docs: `next/dynamic`](https://nextjs.org/docs/app/building-your-application/optimizing/lazy-loading#nextdynamic)
 */ default: function() {
        return dynamic;
    },
    noSSR: function() {
        return noSSR;
    }
});
const _interop_require_default = __turbopack_context__.r("[project]/node_modules/@swc/helpers/cjs/_interop_require_default.cjs [ssr] (ecmascript)");
const _jsxruntime = __turbopack_context__.r("[externals]/react/jsx-runtime [external] (react/jsx-runtime, cjs)");
const _react = /*#__PURE__*/ _interop_require_default._(__turbopack_context__.r("[externals]/react [external] (react, cjs)"));
const _loadablesharedruntime = /*#__PURE__*/ _interop_require_default._(__turbopack_context__.r("[project]/node_modules/next/dist/server/route-modules/pages/vendored/contexts/loadable.js [ssr] (ecmascript)"));
const isServerSide = ("TURBOPACK compile-time value", "undefined") === 'undefined';
// Normalize loader to return the module as form { default: Component } for `React.lazy`.
// Also for backward compatible since next/dynamic allows to resolve a component directly with loader
// Client component reference proxy need to be converted to a module.
function convertModule(mod) {
    return {
        default: mod?.default || mod
    };
}
function noSSR(LoadableInitializer, loadableOptions) {
    // Removing webpack and modules means react-loadable won't try preloading
    delete loadableOptions.webpack;
    delete loadableOptions.modules;
    // This check is necessary to prevent react-loadable from initializing on the server
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    const Loading = loadableOptions.loading;
    // This will only be rendered on the server side
    return ()=>/*#__PURE__*/ (0, _jsxruntime.jsx)(Loading, {
            error: null,
            isLoading: true,
            pastDelay: false,
            timedOut: false
        });
}
function dynamic(dynamicOptions, options) {
    let loadableFn = _loadablesharedruntime.default;
    let loadableOptions = {
        // A loading component is not required, so we default it
        loading: ({ error, isLoading, pastDelay })=>{
            if (!pastDelay) return null;
            if ("TURBOPACK compile-time truthy", 1) {
                if (isLoading) {
                    return null;
                }
                if (error) {
                    return /*#__PURE__*/ (0, _jsxruntime.jsxs)("p", {
                        children: [
                            error.message,
                            /*#__PURE__*/ (0, _jsxruntime.jsx)("br", {}),
                            error.stack
                        ]
                    });
                }
            }
            return null;
        }
    };
    // Support for direct import(), eg: dynamic(import('../hello-world'))
    // Note that this is only kept for the edge case where someone is passing in a promise as first argument
    // The react-loadable babel plugin will turn dynamic(import('../hello-world')) into dynamic(() => import('../hello-world'))
    // To make sure we don't execute the import without rendering first
    if (dynamicOptions instanceof Promise) {
        loadableOptions.loader = ()=>dynamicOptions;
    // Support for having import as a function, eg: dynamic(() => import('../hello-world'))
    } else if (typeof dynamicOptions === 'function') {
        loadableOptions.loader = dynamicOptions;
    // Support for having first argument being options, eg: dynamic({loader: import('../hello-world')})
    } else if (typeof dynamicOptions === 'object') {
        loadableOptions = {
            ...loadableOptions,
            ...dynamicOptions
        };
    }
    // Support for passing options, eg: dynamic(import('../hello-world'), {loading: () => <p>Loading something</p>})
    loadableOptions = {
        ...loadableOptions,
        ...options
    };
    const loaderFn = loadableOptions.loader;
    const loader = ()=>loaderFn != null ? loaderFn().then(convertModule) : Promise.resolve(convertModule(()=>null));
    // coming from build/babel/plugins/react-loadable-plugin.js
    if (loadableOptions.loadableGenerated) {
        loadableOptions = {
            ...loadableOptions,
            ...loadableOptions.loadableGenerated
        };
        delete loadableOptions.loadableGenerated;
    }
    // support for disabling server side rendering, eg: dynamic(() => import('../hello-world'), {ssr: false}).
    if (typeof loadableOptions.ssr === 'boolean' && !loadableOptions.ssr) {
        delete loadableOptions.webpack;
        delete loadableOptions.modules;
        return noSSR(loadableFn, loadableOptions);
    }
    return loadableFn({
        ...loadableOptions,
        loader: loader
    });
}
if ((typeof exports.default === 'function' || typeof exports.default === 'object' && exports.default !== null) && typeof exports.default.__esModule === 'undefined') {
    Object.defineProperty(exports.default, '__esModule', {
        value: true
    });
    Object.assign(exports.default, exports);
    module.exports = exports.default;
}
}),
"[project]/node_modules/next/dynamic.js [ssr] (ecmascript)", ((__turbopack_context__, module, exports) => {

module.exports = __turbopack_context__.r("[project]/node_modules/next/dist/shared/lib/dynamic.js [ssr] (ecmascript)");
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__0cvs.-r._.js.map