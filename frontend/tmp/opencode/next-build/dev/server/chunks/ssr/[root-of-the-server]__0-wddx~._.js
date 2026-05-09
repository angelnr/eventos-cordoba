module.exports = [
"[project]/components/ui/Button.tsx [ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Button",
    ()=>Button
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/react/jsx-dev-runtime [external] (react/jsx-dev-runtime, cjs)");
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
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("button", {
        className: buttonClasses,
        disabled: disabled || isLoading,
        ...props,
        children: [
            isLoading && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("svg", {
                className: "animate-spin -ml-1 mr-2 h-4 w-4",
                xmlns: "http://www.w3.org/2000/svg",
                fill: "none",
                viewBox: "0 0 24 24",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("circle", {
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
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("path", {
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
}),
"[externals]/fs [external] (fs, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("fs", () => require("fs"));

module.exports = mod;
}),
"[externals]/stream [external] (stream, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("stream", () => require("stream"));

module.exports = mod;
}),
"[externals]/zlib [external] (zlib, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("zlib", () => require("zlib"));

module.exports = mod;
}),
"[externals]/react-dom [external] (react-dom, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("react-dom", () => require("react-dom"));

module.exports = mod;
}),
"[project]/components/UserMenu.tsx [ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "UserMenu",
    ()=>UserMenu
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/react/jsx-dev-runtime [external] (react/jsx-dev-runtime, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/react [external] (react, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$link$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/link.js [ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$auth$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/auth.tsx [ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$router$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/router.js [ssr] (ecmascript)");
;
;
;
;
;
const UserMenu = ()=>{
    const { user, logout } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$auth$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__["useAuth"])();
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$router$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__["useRouter"])();
    const [isOpen, setIsOpen] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])(false);
    const menuRef = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useRef"])(null);
    (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useEffect"])(()=>{
        const handleClickOutside = (event)=>{
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return ()=>document.removeEventListener('mousedown', handleClickOutside);
    }, []);
    (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useEffect"])(()=>{
        setIsOpen(false);
    }, [
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
            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("img", {
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
            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                className: "w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 dark:from-blue-400 dark:to-purple-500 rounded-full flex items-center justify-center text-white font-semibold text-sm",
                children: getInitials(user.name)
            }, void 0, false, {
                fileName: "[project]/components/UserMenu.tsx",
                lineNumber: 53,
                columnNumber: 9
            }, ("TURBOPACK compile-time value", void 0));
        }
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
            className: "w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("svg", {
                className: "w-5 h-5 text-gray-600 dark:text-gray-300",
                fill: "currentColor",
                viewBox: "0 0 20 20",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("path", {
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
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
            className: "flex items-center space-x-4",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$link$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__["default"], {
                    href: "/login",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("button", {
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
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$link$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__["default"], {
                    href: "/register",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("button", {
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
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
        className: "relative",
        ref: menuRef,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("button", {
                onClick: ()=>setIsOpen(!isOpen),
                className: "flex items-center space-x-2 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900",
                "aria-expanded": isOpen,
                "aria-haspopup": "true",
                children: [
                    getAvatarContent(),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("svg", {
                        className: `w-4 h-4 text-gray-600 dark:text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`,
                        fill: "none",
                        stroke: "currentColor",
                        viewBox: "0 0 24 24",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("path", {
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
            isOpen && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                className: "absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-50",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                        className: "px-4 py-3 border-b border-gray-200 dark:border-gray-700",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                            className: "flex items-center space-x-3",
                            children: [
                                getAvatarContent(),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                    className: "flex-1 min-w-0",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("p", {
                                            className: "text-sm font-medium text-gray-900 dark:text-gray-100 truncate",
                                            children: user.name
                                        }, void 0, false, {
                                            fileName: "[project]/components/UserMenu.tsx",
                                            lineNumber: 109,
                                            columnNumber: 17
                                        }, ("TURBOPACK compile-time value", void 0)),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("p", {
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
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                        className: "py-2",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$link$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__["default"], {
                                href: `/profile/${user.id}`,
                                className: "flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white transition-colors",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("svg", {
                                        className: "w-4 h-4 mr-3",
                                        fill: "none",
                                        stroke: "currentColor",
                                        viewBox: "0 0 24 24",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("path", {
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
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$link$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__["default"], {
                                href: "/profile/edit",
                                className: "flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white transition-colors",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("svg", {
                                        className: "w-4 h-4 mr-3",
                                        fill: "none",
                                        stroke: "currentColor",
                                        viewBox: "0 0 24 24",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("path", {
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
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$link$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__["default"], {
                                href: "/events/create",
                                className: "flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white transition-colors",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("svg", {
                                        className: "w-4 h-4 mr-3",
                                        fill: "none",
                                        stroke: "currentColor",
                                        viewBox: "0 0 24 24",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("path", {
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
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$link$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__["default"], {
                                href: "/events/my-events",
                                className: "flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white transition-colors",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("svg", {
                                        className: "w-4 h-4 mr-3",
                                        fill: "none",
                                        stroke: "currentColor",
                                        viewBox: "0 0 24 24",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("path", {
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
                            user.role === 'admin' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$link$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__["default"], {
                                href: "/dashboard",
                                className: "flex items-center px-4 py-2 text-sm text-blue-600 dark:text-blue-400 font-medium hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("svg", {
                                        className: "w-4 h-4 mr-3",
                                        fill: "none",
                                        stroke: "currentColor",
                                        viewBox: "0 0 24 24",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("path", {
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
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                        className: "border-t border-gray-200 dark:border-gray-700 my-1"
                    }, void 0, false, {
                        fileName: "[project]/components/UserMenu.tsx",
                        lineNumber: 174,
                        columnNumber: 11
                    }, ("TURBOPACK compile-time value", void 0)),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("button", {
                        onClick: handleLogout,
                        className: "flex items-center w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 hover:text-red-700 dark:hover:text-red-300 transition-colors",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("svg", {
                                className: "w-4 h-4 mr-3",
                                fill: "none",
                                stroke: "currentColor",
                                viewBox: "0 0 24 24",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("path", {
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
}),
"[project]/components/ui/ThemeToggle.tsx [ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ThemeToggle",
    ()=>ThemeToggle
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/react/jsx-dev-runtime [external] (react/jsx-dev-runtime, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$theme$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/theme.tsx [ssr] (ecmascript)");
;
;
const ThemeToggle = ()=>{
    const { resolvedTheme, toggleTheme } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$theme$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__["useTheme"])();
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("button", {
        onClick: toggleTheme,
        type: "button",
        "aria-label": resolvedTheme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro',
        className: "relative inline-flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("svg", {
                className: `h-5 w-5 transition-transform ${resolvedTheme === 'dark' ? 'scale-100 rotate-0' : 'scale-0 rotate-90'}`,
                fill: "none",
                viewBox: "0 0 24 24",
                stroke: "currentColor",
                strokeWidth: 2,
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("path", {
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
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("svg", {
                className: `absolute h-5 w-5 transition-transform ${resolvedTheme === 'dark' ? 'scale-0 rotate-90' : 'scale-100 rotate-0'}`,
                fill: "none",
                viewBox: "0 0 24 24",
                stroke: "currentColor",
                strokeWidth: 2,
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("path", {
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
}),
"[project]/lib/api.ts [ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ApiError",
    ()=>ApiError,
    "apiFetch",
    ()=>apiFetch
]);
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
    if ("TURBOPACK compile-time truthy", 1) {
        return ("TURBOPACK compile-time value", "") || 'http://localhost:3001';
    }
    //TURBOPACK unreachable
    ;
    const hostname = undefined;
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
}),
"[project]/lib/queries/useNotifications.ts [ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

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
var __TURBOPACK__imported__module__$5b$externals$5d2f40$tanstack$2f$react$2d$query__$5b$external$5d$__$2840$tanstack$2f$react$2d$query$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$29$__ = __turbopack_context__.i("[externals]/@tanstack/react-query [external] (@tanstack/react-query, esm_import, [project]/node_modules/@tanstack/react-query)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/api.ts [ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$queryClient$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/queryClient.ts [ssr] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$externals$5d2f40$tanstack$2f$react$2d$query__$5b$external$5d$__$2840$tanstack$2f$react$2d$query$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$queryClient$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$externals$5d2f40$tanstack$2f$react$2d$query__$5b$external$5d$__$2840$tanstack$2f$react$2d$query$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$queryClient$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
function useUnreadCount(token) {
    return (0, __TURBOPACK__imported__module__$5b$externals$5d2f40$tanstack$2f$react$2d$query__$5b$external$5d$__$2840$tanstack$2f$react$2d$query$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$29$__["useQuery"])({
        queryKey: [
            'notifications',
            'unread-count'
        ],
        queryFn: ()=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__["apiFetch"])('/api/notifications/unread-count', {
                token: token || undefined
            }),
        enabled: !!token,
        refetchInterval: 30_000,
        refetchIntervalInBackground: false,
        staleTime: 15_000
    });
}
function useNotifications(token, options) {
    const params = new URLSearchParams();
    if (options?.unreadOnly) params.set('unreadOnly', 'true');
    if (options?.page) params.set('page', String(options.page));
    return (0, __TURBOPACK__imported__module__$5b$externals$5d2f40$tanstack$2f$react$2d$query__$5b$external$5d$__$2840$tanstack$2f$react$2d$query$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$29$__["useQuery"])({
        queryKey: [
            'notifications',
            'list',
            options
        ],
        queryFn: ()=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__["apiFetch"])(`/api/notifications?${params.toString()}`, {
                token: token || undefined
            }),
        enabled: !!token,
        staleTime: 15_000
    });
}
function useMarkAsRead(token) {
    return (0, __TURBOPACK__imported__module__$5b$externals$5d2f40$tanstack$2f$react$2d$query__$5b$external$5d$__$2840$tanstack$2f$react$2d$query$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$29$__["useMutation"])({
        mutationFn: (id)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__["apiFetch"])(`/api/notifications/${id}/read`, {
                token: token || undefined,
                method: 'PATCH'
            }),
        onSuccess: ()=>{
            __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$queryClient$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__["queryClient"].invalidateQueries({
                queryKey: [
                    'notifications'
                ]
            });
        }
    });
}
function useMarkAllAsRead(token) {
    return (0, __TURBOPACK__imported__module__$5b$externals$5d2f40$tanstack$2f$react$2d$query__$5b$external$5d$__$2840$tanstack$2f$react$2d$query$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$29$__["useMutation"])({
        mutationFn: ()=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__["apiFetch"])('/api/notifications/mark-all-read', {
                token: token || undefined,
                method: 'PATCH'
            }),
        onSuccess: ()=>{
            __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$queryClient$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__["queryClient"].invalidateQueries({
                queryKey: [
                    'notifications'
                ]
            });
        }
    });
}
function useDeleteNotification(token) {
    return (0, __TURBOPACK__imported__module__$5b$externals$5d2f40$tanstack$2f$react$2d$query__$5b$external$5d$__$2840$tanstack$2f$react$2d$query$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$29$__["useMutation"])({
        mutationFn: (id)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__["apiFetch"])(`/api/notifications/${id}`, {
                token: token || undefined,
                method: 'DELETE'
            }),
        onSuccess: ()=>{
            __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$queryClient$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__["queryClient"].invalidateQueries({
                queryKey: [
                    'notifications'
                ]
            });
        }
    });
}
function useDeleteReadNotifications(token) {
    return (0, __TURBOPACK__imported__module__$5b$externals$5d2f40$tanstack$2f$react$2d$query__$5b$external$5d$__$2840$tanstack$2f$react$2d$query$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$29$__["useMutation"])({
        mutationFn: ()=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__["apiFetch"])('/api/notifications/read-all', {
                token: token || undefined,
                method: 'DELETE'
            }),
        onSuccess: ()=>{
            __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$queryClient$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__["queryClient"].invalidateQueries({
                queryKey: [
                    'notifications'
                ]
            });
        }
    });
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/components/notifications/NotificationItem.tsx [ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "NotificationItem",
    ()=>NotificationItem
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/react/jsx-dev-runtime [external] (react/jsx-dev-runtime, cjs)");
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
        icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("svg", {
            className: "w-5 h-5",
            fill: "none",
            viewBox: "0 0 24 24",
            stroke: "currentColor",
            strokeWidth: 2,
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("path", {
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
        icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("svg", {
            className: "w-5 h-5",
            fill: "none",
            viewBox: "0 0 24 24",
            stroke: "currentColor",
            strokeWidth: 2,
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("path", {
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
        icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("svg", {
            className: "w-5 h-5",
            fill: "none",
            viewBox: "0 0 24 24",
            stroke: "currentColor",
            strokeWidth: 2,
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("path", {
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
        icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("svg", {
            className: "w-5 h-5",
            fill: "none",
            viewBox: "0 0 24 24",
            stroke: "currentColor",
            strokeWidth: 2,
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("path", {
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
        icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("svg", {
            className: "w-5 h-5",
            fill: "none",
            viewBox: "0 0 24 24",
            stroke: "currentColor",
            strokeWidth: 2,
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("path", {
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
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
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
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                className: "flex items-start space-x-3",
                children: [
                    !notification.isRead && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                        className: "w-2 h-2 bg-blue-500 rounded-full mt-1.5 flex-shrink-0"
                    }, void 0, false, {
                        fileName: "[project]/components/notifications/NotificationItem.tsx",
                        lineNumber: 105,
                        columnNumber: 11
                    }, ("TURBOPACK compile-time value", void 0)),
                    notification.isRead && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                        className: "w-2 h-2 flex-shrink-0"
                    }, void 0, false, {
                        fileName: "[project]/components/notifications/NotificationItem.tsx",
                        lineNumber: 108,
                        columnNumber: 11
                    }, ("TURBOPACK compile-time value", void 0)),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                        className: `flex-shrink-0 mt-0.5 ${config.iconColor}`,
                        children: config.icon
                    }, void 0, false, {
                        fileName: "[project]/components/notifications/NotificationItem.tsx",
                        lineNumber: 110,
                        columnNumber: 9
                    }, ("TURBOPACK compile-time value", void 0)),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                        className: "flex-1 min-w-0",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                className: "flex items-start justify-between gap-2",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("p", {
                                        className: "font-medium text-gray-900 dark:text-gray-100 text-sm",
                                        children: notification.title
                                    }, void 0, false, {
                                        fileName: "[project]/components/notifications/NotificationItem.tsx",
                                        lineNumber: 115,
                                        columnNumber: 13
                                    }, ("TURBOPACK compile-time value", void 0)),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("span", {
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
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("p", {
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
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("button", {
                        onClick: (e)=>{
                            e.stopPropagation();
                            onDelete(notification.id);
                        },
                        className: "opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-all flex-shrink-0 p-0.5",
                        "aria-label": "Eliminar notificaci\\u00f3n",
                        title: "Eliminar",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("svg", {
                            className: "w-4 h-4",
                            fill: "none",
                            viewBox: "0 0 24 24",
                            stroke: "currentColor",
                            strokeWidth: 2,
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("path", {
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
            isMarkingAsRead && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
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
}),
"[project]/components/notifications/NotificationDropdown.tsx [ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "NotificationDropdown",
    ()=>NotificationDropdown
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/react/jsx-dev-runtime [external] (react/jsx-dev-runtime, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/react [external] (react, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$router$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/router.js [ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$auth$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/auth.tsx [ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$queries$2f$useNotifications$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/queries/useNotifications.ts [ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$notifications$2f$NotificationItem$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/notifications/NotificationItem.tsx [ssr] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$queries$2f$useNotifications$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$queries$2f$useNotifications$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
;
;
;
const NotificationDropdown = ({ onClose })=>{
    const { token } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$auth$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__["useAuth"])();
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$router$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__["useRouter"])();
    const [page, setPage] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])(1);
    const [readingIds, setReadingIds] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])(new Set());
    const { data, isLoading, isError, refetch } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$queries$2f$useNotifications$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__["useNotifications"])(token, {
        page,
        unreadOnly: false
    });
    const { data: unreadData } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$queries$2f$useNotifications$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__["useUnreadCount"])(token);
    const markAsRead = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$queries$2f$useNotifications$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__["useMarkAsRead"])(token);
    const markAllAsRead = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$queries$2f$useNotifications$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__["useMarkAllAsRead"])(token);
    const deleteNotification = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$queries$2f$useNotifications$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__["useDeleteNotification"])(token);
    const deleteRead = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$queries$2f$useNotifications$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__["useDeleteReadNotifications"])(token);
    const unreadCount = unreadData?.data?.unreadCount ?? 0;
    const notifications = data?.data ?? [];
    const pagination = data?.pagination;
    const handleMarkAsRead = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useCallback"])((id)=>{
        setReadingIds((prev)=>new Set(prev).add(id));
        markAsRead.mutate(id, {
            onSettled: ()=>{
                setReadingIds((prev)=>{
                    const next = new Set(prev);
                    next.delete(id);
                    return next;
                });
            }
        });
    }, [
        markAsRead
    ]);
    const handleDelete = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useCallback"])((id)=>{
        deleteNotification.mutate(id);
    }, [
        deleteNotification
    ]);
    const handleNavigate = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useCallback"])((link)=>{
        onClose();
        router.push(link);
    }, [
        onClose,
        router
    ]);
    const handleLoadMore = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useCallback"])(()=>{
        if (pagination?.hasNext) {
            setPage((prev)=>prev + 1);
        }
    }, [
        pagination?.hasNext
    ]);
    const handleMarkAllRead = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useCallback"])(()=>{
        markAllAsRead.mutate();
    }, [
        markAllAsRead
    ]);
    const handleCleanup = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useCallback"])(()=>{
        deleteRead.mutate();
    }, [
        deleteRead
    ]);
    const hasReadNotifications = notifications.some((n)=>n.isRead);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
        className: "absolute right-0 mt-2 w-80 sm:w-96 max-h-[480px] overflow-y-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50",
        role: "menu",
        "aria-label": "Lista de notificaciones",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                className: "sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3 z-10",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                    className: "flex items-center justify-between",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("h3", {
                            className: "font-semibold text-gray-900 dark:text-gray-100 text-sm",
                            children: [
                                "Notificaciones",
                                unreadCount > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("span", {
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
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                            className: "flex items-center space-x-2",
                            children: [
                                unreadCount > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("button", {
                                    onClick: handleMarkAllRead,
                                    className: "text-xs text-blue-600 dark:text-blue-400 hover:underline",
                                    disabled: markAllAsRead.isPending,
                                    children: markAllAsRead.isPending ? '...' : 'Marcar todas leídas'
                                }, void 0, false, {
                                    fileName: "[project]/components/notifications/NotificationDropdown.tsx",
                                    lineNumber: 93,
                                    columnNumber: 15
                                }, ("TURBOPACK compile-time value", void 0)),
                                hasReadNotifications && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("button", {
                                    onClick: handleCleanup,
                                    className: "text-xs text-gray-400 hover:text-red-500 dark:hover:text-red-400 disabled:opacity-50",
                                    title: "Limpiar leídas",
                                    disabled: deleteRead.isPending,
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("svg", {
                                        className: "w-4 h-4",
                                        fill: "none",
                                        viewBox: "0 0 24 24",
                                        stroke: "currentColor",
                                        strokeWidth: 2,
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("path", {
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
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                className: "divide-y divide-gray-100 dark:divide-gray-700",
                children: [
                    isLoading && page === 1 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                        className: "p-4 space-y-3",
                        children: [
                            1,
                            2,
                            3
                        ].map((i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                className: "animate-pulse flex space-x-3",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                        className: "w-2 h-2 bg-gray-200 dark:bg-gray-600 rounded-full mt-1"
                                    }, void 0, false, {
                                        fileName: "[project]/components/notifications/NotificationDropdown.tsx",
                                        lineNumber: 123,
                                        columnNumber: 17
                                    }, ("TURBOPACK compile-time value", void 0)),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                        className: "flex-1 space-y-2",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                className: "h-3 bg-gray-200 dark:bg-gray-600 rounded w-3/4"
                                            }, void 0, false, {
                                                fileName: "[project]/components/notifications/NotificationDropdown.tsx",
                                                lineNumber: 125,
                                                columnNumber: 19
                                            }, ("TURBOPACK compile-time value", void 0)),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
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
                    isError && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                        className: "p-8 text-center",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("p", {
                                className: "text-sm text-gray-500 dark:text-gray-400 mb-3",
                                children: "Error al cargar notificaciones"
                            }, void 0, false, {
                                fileName: "[project]/components/notifications/NotificationDropdown.tsx",
                                lineNumber: 135,
                                columnNumber: 13
                            }, ("TURBOPACK compile-time value", void 0)),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("button", {
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
                    !isLoading && !isError && notifications.length === 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                        className: "p-8 text-center",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("svg", {
                                className: "w-10 h-10 mx-auto text-gray-300 dark:text-gray-600 mb-2",
                                fill: "none",
                                viewBox: "0 0 24 24",
                                stroke: "currentColor",
                                strokeWidth: 1.5,
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("path", {
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
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("p", {
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
                    notifications.map((n)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$notifications$2f$NotificationItem$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__["NotificationItem"], {
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
                    pagination?.hasNext && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                        className: "p-3 text-center",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("button", {
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
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/components/notifications/NotificationBell.tsx [ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "NotificationBell",
    ()=>NotificationBell
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/react/jsx-dev-runtime [external] (react/jsx-dev-runtime, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/react [external] (react, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$auth$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/auth.tsx [ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$queries$2f$useNotifications$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/queries/useNotifications.ts [ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$notifications$2f$NotificationDropdown$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/notifications/NotificationDropdown.tsx [ssr] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$queries$2f$useNotifications$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$notifications$2f$NotificationDropdown$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$queries$2f$useNotifications$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$notifications$2f$NotificationDropdown$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
;
;
const NotificationBell = ()=>{
    const { user, token } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$auth$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__["useAuth"])();
    const [isOpen, setIsOpen] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])(false);
    const containerRef = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useRef"])(null);
    const { data: unreadData } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$queries$2f$useNotifications$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__["useUnreadCount"])(token);
    const unreadCount = unreadData?.data?.unreadCount ?? 0;
    const handleClose = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useCallback"])(()=>{
        setIsOpen(false);
    }, []);
    (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useEffect"])(()=>{
        const handleClickOutside = (event)=>{
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return ()=>document.removeEventListener('mousedown', handleClickOutside);
    }, []);
    (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useEffect"])(()=>{
        const handleEscape = (event)=>{
            if (event.key === 'Escape') {
                setIsOpen(false);
            }
        };
        document.addEventListener('keydown', handleEscape);
        return ()=>document.removeEventListener('keydown', handleEscape);
    }, []);
    if (!user) return null;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
        className: "relative",
        ref: containerRef,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("button", {
                onClick: ()=>setIsOpen(!isOpen),
                type: "button",
                "aria-label": `Notificaciones${unreadCount > 0 ? `, ${unreadCount} sin leer` : ''}`,
                "aria-expanded": isOpen,
                "aria-haspopup": "menu",
                className: "relative p-2 rounded-full text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("svg", {
                        className: "w-5 h-5",
                        fill: "none",
                        viewBox: "0 0 24 24",
                        stroke: "currentColor",
                        strokeWidth: 2,
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("path", {
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
                    unreadCount > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("span", {
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
            isOpen && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$notifications$2f$NotificationDropdown$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__["NotificationDropdown"], {
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
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/components/Layout.tsx [ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "Layout",
    ()=>Layout
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/react/jsx-dev-runtime [external] (react/jsx-dev-runtime, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$link$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/link.js [ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$Button$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/ui/Button.tsx [ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$UserMenu$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/UserMenu.tsx [ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$ThemeToggle$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/ui/ThemeToggle.tsx [ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$notifications$2f$NotificationBell$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/notifications/NotificationBell.tsx [ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$auth$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/auth.tsx [ssr] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$notifications$2f$NotificationBell$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$notifications$2f$NotificationBell$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
;
;
;
;
const Layout = ({ children })=>{
    const { user } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$auth$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__["useAuth"])();
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
        className: "min-h-screen bg-gray-50 dark:bg-gray-900",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("nav", {
                className: "bg-white shadow-sm border-b border-gray-200 dark:bg-gray-800 dark:border-gray-700",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                    className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                        className: "flex justify-between h-16",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                className: "flex items-center",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$link$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__["default"], {
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
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                className: "flex items-center space-x-2 sm:space-x-4",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$link$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__["default"], {
                                        href: "/events",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$Button$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__["Button"], {
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
                                    user && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$link$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__["default"], {
                                        href: "/favorites",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$Button$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__["Button"], {
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
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$ThemeToggle$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__["ThemeToggle"], {}, void 0, false, {
                                        fileName: "[project]/components/Layout.tsx",
                                        lineNumber: 41,
                                        columnNumber: 15
                                    }, ("TURBOPACK compile-time value", void 0)),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$notifications$2f$NotificationBell$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__["NotificationBell"], {}, void 0, false, {
                                        fileName: "[project]/components/Layout.tsx",
                                        lineNumber: 42,
                                        columnNumber: 15
                                    }, ("TURBOPACK compile-time value", void 0)),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$UserMenu$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__["UserMenu"], {}, void 0, false, {
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
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("main", {
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
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/lib/useEventFilters.ts [ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "useEventFilters",
    ()=>useEventFilters
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$router$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/router.js [ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/react [external] (react, cjs)");
;
;
const DEFAULT_FILTERS = {
    page: 1,
    limit: 12,
    sortBy: 'date',
    sortOrder: 'asc'
};
function useEventFilters() {
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$router$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__["useRouter"])();
    const filters = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useMemo"])(()=>{
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
    }, [
        router.query
    ]);
    const setFilters = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useCallback"])((updates)=>{
        const merged = {
            ...filters,
            ...updates
        };
        if (!('page' in updates)) {
            merged.page = 1;
        }
        const params = new URLSearchParams();
        Object.entries(merged).forEach(([key, value])=>{
            if (value != null && value !== '' && value !== false) {
                params.set(key, String(value));
            }
        });
        router.push(`/events?${params.toString()}`, undefined, {
            shallow: true
        });
    }, [
        router,
        filters
    ]);
    const resetFilters = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useCallback"])(()=>{
        router.push('/events', undefined, {
            shallow: true
        });
    }, [
        router
    ]);
    const removeFilter = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useCallback"])((key)=>{
        const newFilters = {
            ...filters
        };
        delete newFilters[key];
        newFilters.page = 1;
        const params = new URLSearchParams();
        Object.entries(newFilters).forEach(([k, v])=>{
            if (v != null && v !== '' && v !== false) {
                params.set(k, String(v));
            }
        });
        router.push(`/events?${params.toString()}`, undefined, {
            shallow: true
        });
    }, [
        router,
        filters
    ]);
    const activeFilterCount = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useMemo"])(()=>{
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
    }, [
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
}),
"[project]/lib/queries/useEvents.ts [ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "useEvents",
    ()=>useEvents,
    "useFiltersMeta",
    ()=>useFiltersMeta
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f40$tanstack$2f$react$2d$query__$5b$external$5d$__$2840$tanstack$2f$react$2d$query$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$29$__ = __turbopack_context__.i("[externals]/@tanstack/react-query [external] (@tanstack/react-query, esm_import, [project]/node_modules/@tanstack/react-query)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/api.ts [ssr] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$externals$5d2f40$tanstack$2f$react$2d$query__$5b$external$5d$__$2840$tanstack$2f$react$2d$query$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$29$__
]);
[__TURBOPACK__imported__module__$5b$externals$5d2f40$tanstack$2f$react$2d$query__$5b$external$5d$__$2840$tanstack$2f$react$2d$query$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
function useEvents(filters, token) {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value])=>{
        if (value != null && value !== '' && value !== false) {
            params.set(key, String(value));
        }
    });
    return (0, __TURBOPACK__imported__module__$5b$externals$5d2f40$tanstack$2f$react$2d$query__$5b$external$5d$__$2840$tanstack$2f$react$2d$query$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$29$__["useQuery"])({
        queryKey: [
            'events',
            filters
        ],
        queryFn: ()=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__["apiFetch"])(`/api/events?${params.toString()}`, {
                token
            }),
        staleTime: 30_000,
        gcTime: 300_000
    });
}
function useFiltersMeta() {
    return (0, __TURBOPACK__imported__module__$5b$externals$5d2f40$tanstack$2f$react$2d$query__$5b$external$5d$__$2840$tanstack$2f$react$2d$query$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$29$__["useQuery"])({
        queryKey: [
            'filters-meta'
        ],
        queryFn: ()=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__["apiFetch"])('/api/events/filters-meta'),
        staleTime: 60_000,
        gcTime: 600_000
    });
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/lib/useDebounce.ts [ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "useDebounce",
    ()=>useDebounce
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/react [external] (react, cjs)");
;
function useDebounce(value, delay) {
    const [debouncedValue, setDebouncedValue] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])(value);
    (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useEffect"])(()=>{
        const timer = setTimeout(()=>setDebouncedValue(value), delay);
        return ()=>clearTimeout(timer);
    }, [
        value,
        delay
    ]);
    return debouncedValue;
}
}),
"[project]/components/filters/DatePresetFilter.tsx [ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>DatePresetFilter
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/react/jsx-dev-runtime [external] (react/jsx-dev-runtime, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$Button$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/ui/Button.tsx [ssr] (ecmascript)");
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
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
        className: "flex flex-wrap gap-2",
        children: PRESETS.map((preset)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$Button$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__["Button"], {
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
}),
"[project]/components/filters/PriceRangeFilter.tsx [ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>PriceRangeFilter
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/react/jsx-dev-runtime [external] (react/jsx-dev-runtime, cjs)");
;
function PriceRangeFilter({ minPrice, maxPrice, priceMin, priceMax, onChange, onFreeToggle, isFree }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
        className: "flex flex-col gap-2",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("label", {
                className: "text-sm font-medium text-gray-700 dark:text-gray-300",
                children: "Precio"
            }, void 0, false, {
                fileName: "[project]/components/filters/PriceRangeFilter.tsx",
                lineNumber: 24,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                className: "flex items-center gap-2",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("input", {
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
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("span", {
                        className: "text-gray-400 dark:text-gray-500",
                        children: "—"
                    }, void 0, false, {
                        fileName: "[project]/components/filters/PriceRangeFilter.tsx",
                        lineNumber: 39,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("input", {
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
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("span", {
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
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("label", {
                className: "flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("input", {
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
}),
"[project]/components/filters/RatingFilter.tsx [ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>RatingFilter
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/react/jsx-dev-runtime [external] (react/jsx-dev-runtime, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/react [external] (react, cjs)");
;
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
    const [hover, setHover] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])(null);
    const displayValue = hover ?? value;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
        className: "flex flex-col gap-1",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("label", {
                className: "text-sm font-medium text-gray-700 dark:text-gray-300",
                children: "Rating mínimo"
            }, void 0, false, {
                fileName: "[project]/components/filters/RatingFilter.tsx",
                lineNumber: 18,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
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
                        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("button", {
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
                    value != null && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("span", {
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
}),
"[project]/components/filters/AvailabilityFilter.tsx [ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>AvailabilityFilter
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/react/jsx-dev-runtime [external] (react/jsx-dev-runtime, cjs)");
;
function AvailabilityFilter({ available, soldOut, isFree, onChange, totalAvailableEvents, totalSoldOutEvents, totalFreeEvents }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
        className: "flex flex-col gap-2",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("label", {
                className: "text-sm font-medium text-gray-700 dark:text-gray-300",
                children: "Disponibilidad"
            }, void 0, false, {
                fileName: "[project]/components/filters/AvailabilityFilter.tsx",
                lineNumber: 24,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("label", {
                className: "flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("input", {
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
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("label", {
                className: "flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("input", {
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
            totalFreeEvents != null && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("label", {
                className: "flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("input", {
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
}),
"[project]/components/filters/SortSelect.tsx [ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>SortSelect
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/react/jsx-dev-runtime [external] (react/jsx-dev-runtime, cjs)");
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
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
        className: "flex items-center gap-2",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("label", {
                htmlFor: "sort-select",
                className: "text-sm text-gray-600 dark:text-gray-400 hidden sm:inline",
                children: "Ordenar:"
            }, void 0, false, {
                fileName: "[project]/components/filters/SortSelect.tsx",
                lineNumber: 25,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("select", {
                id: "sort-select",
                value: `${sortBy}-${sortOrder}`,
                onChange: (e)=>{
                    const [newSortBy, newSortOrder] = e.target.value.split('-');
                    onChange(newSortBy, newSortOrder);
                },
                className: "border rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
                children: OPTIONS.map((opt)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("option", {
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
}),
"[project]/components/filters/ActiveFilters.tsx [ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>ActiveFilters
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/react/jsx-dev-runtime [external] (react/jsx-dev-runtime, cjs)");
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
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
        className: "flex flex-wrap items-center gap-2 mb-4",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("span", {
                className: "text-sm text-gray-500 dark:text-gray-400 font-medium",
                children: "Filtros activos:"
            }, void 0, false, {
                fileName: "[project]/components/filters/ActiveFilters.tsx",
                lineNumber: 65,
                columnNumber: 7
            }, this),
            activeChips.map((chip)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("button", {
                    onClick: ()=>onRemove(chip.key),
                    className: "inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm bg-blue-100 dark:bg-blue-900/30 text-blue-800 hover:bg-blue-200 dark:hover:bg-blue-900/40 transition-colors",
                    "aria-label": `Eliminar filtro: ${chip.label}`,
                    children: [
                        chip.label,
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("span", {
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
            activeCount > 1 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("button", {
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
}),
"[project]/components/filters/FilterBar.tsx [ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>FilterBar
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/react/jsx-dev-runtime [external] (react/jsx-dev-runtime, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/react [external] (react, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$useDebounce$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/useDebounce.ts [ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$Button$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/ui/Button.tsx [ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$filters$2f$DatePresetFilter$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/filters/DatePresetFilter.tsx [ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$filters$2f$PriceRangeFilter$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/filters/PriceRangeFilter.tsx [ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$filters$2f$RatingFilter$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/filters/RatingFilter.tsx [ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$filters$2f$AvailabilityFilter$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/filters/AvailabilityFilter.tsx [ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$filters$2f$SortSelect$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/filters/SortSelect.tsx [ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$filters$2f$ActiveFilters$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/filters/ActiveFilters.tsx [ssr] (ecmascript)");
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
function FilterBar({ filters, categories, priceMin, priceMax, totalAvailableEvents, totalSoldOutEvents, totalFreeEvents, onSetFilters, onRemoveFilter, onResetFilters, activeFilterCount }) {
    const [showMobile, setShowMobile] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])(false);
    const [searchInput, setSearchInput] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])(filters.search || '');
    const debouncedSearch = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$useDebounce$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__["useDebounce"])(searchInput, 300);
    (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useEffect"])(()=>{
        if (debouncedSearch !== (filters.search || '')) {
            onSetFilters({
                search: debouncedSearch || undefined
            });
        }
    }, [
        debouncedSearch
    ]);
    (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useEffect"])(()=>{
        if (!filters.search) {
            setSearchInput('');
        }
    }, [
        filters.search
    ]);
    const content = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
        className: "space-y-4",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("label", {
                        htmlFor: "search-input",
                        className: "text-sm font-medium text-gray-700 dark:text-gray-300",
                        children: "Buscar eventos"
                    }, void 0, false, {
                        fileName: "[project]/components/filters/FilterBar.tsx",
                        lineNumber: 59,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("input", {
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
            categories && categories.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("label", {
                        className: "text-sm font-medium text-gray-700 dark:text-gray-300",
                        children: "Categoría"
                    }, void 0, false, {
                        fileName: "[project]/components/filters/FilterBar.tsx",
                        lineNumber: 75,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                        className: "mt-1 flex flex-wrap gap-2",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$Button$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__["Button"], {
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
                            categories.map((cat)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$Button$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__["Button"], {
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
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("label", {
                        className: "text-sm font-medium text-gray-700 dark:text-gray-300",
                        children: "Fecha"
                    }, void 0, false, {
                        fileName: "[project]/components/filters/FilterBar.tsx",
                        lineNumber: 101,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                        className: "mt-1",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$filters$2f$DatePresetFilter$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__["default"], {
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
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$filters$2f$PriceRangeFilter$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__["default"], {
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
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$filters$2f$RatingFilter$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__["default"], {
                value: filters.minRating,
                onChange: (rating)=>onSetFilters({
                        minRating: rating
                    })
            }, void 0, false, {
                fileName: "[project]/components/filters/FilterBar.tsx",
                lineNumber: 122,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$filters$2f$AvailabilityFilter$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__["default"], {
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
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$filters$2f$SortSelect$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__["default"], {
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
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["Fragment"], {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                className: "hidden md:block mb-6 p-4 bg-white dark:bg-gray-800 border rounded-lg",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$filters$2f$ActiveFilters$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__["default"], {
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
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                className: "md:hidden mb-4",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$filters$2f$ActiveFilters$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__["default"], {
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
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$Button$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__["Button"], {
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
            showMobile && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                className: "fixed inset-0 z-50 md:hidden",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                        className: "absolute inset-0 bg-black bg-opacity-50",
                        onClick: ()=>setShowMobile(false)
                    }, void 0, false, {
                        fileName: "[project]/components/filters/FilterBar.tsx",
                        lineNumber: 184,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                        className: "absolute left-0 top-0 bottom-0 w-80 max-w-[85vw] bg-white dark:bg-gray-800 p-4 overflow-y-auto shadow-xl",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                className: "flex items-center justify-between mb-4",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("h2", {
                                        className: "text-lg font-semibold",
                                        children: "Filtros"
                                    }, void 0, false, {
                                        fileName: "[project]/components/filters/FilterBar.tsx",
                                        lineNumber: 190,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("button", {
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
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                className: "mt-6 flex gap-2",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$Button$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__["Button"], {
                                        variant: "primary",
                                        onClick: ()=>setShowMobile(false),
                                        className: "flex-1",
                                        children: "Aplicar filtros"
                                    }, void 0, false, {
                                        fileName: "[project]/components/filters/FilterBar.tsx",
                                        lineNumber: 201,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$Button$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__["Button"], {
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
}),
"[project]/components/filters/Pagination.tsx [ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>Pagination
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/react/jsx-dev-runtime [external] (react/jsx-dev-runtime, cjs)");
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
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
        className: "flex flex-col sm:flex-row items-center justify-between gap-4 mt-8",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("p", {
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
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("nav", {
                className: "flex items-center gap-1",
                "aria-label": "Paginación",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("button", {
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
                    getPageNumbers(page, pages).map((item, i)=>typeof item === 'string' ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("span", {
                            className: "px-2 text-gray-400 dark:text-gray-500",
                            children: "..."
                        }, `ellipsis-${i}`, false, {
                            fileName: "[project]/components/filters/Pagination.tsx",
                            lineNumber: 61,
                            columnNumber: 13
                        }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("button", {
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
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("button", {
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
}),
"[project]/components/filters/SkeletonLoader.tsx [ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>SkeletonLoader
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/react/jsx-dev-runtime [external] (react/jsx-dev-runtime, cjs)");
;
function SkeletonLoader({ count = 12 }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
        className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6",
        children: Array.from({
            length: count
        }).map((_, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                className: "bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden animate-pulse",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                        className: "h-48 bg-gray-200 dark:bg-gray-700"
                    }, void 0, false, {
                        fileName: "[project]/components/filters/SkeletonLoader.tsx",
                        lineNumber: 12,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                        className: "p-4 space-y-3",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                className: "flex justify-between",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                        className: "h-5 w-20 bg-gray-200 dark:bg-gray-700 rounded"
                                    }, void 0, false, {
                                        fileName: "[project]/components/filters/SkeletonLoader.tsx",
                                        lineNumber: 15,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
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
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                className: "h-6 w-3/4 bg-gray-200 dark:bg-gray-700 rounded"
                            }, void 0, false, {
                                fileName: "[project]/components/filters/SkeletonLoader.tsx",
                                lineNumber: 18,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                className: "h-4 w-1/2 bg-gray-200 dark:bg-gray-700 rounded"
                            }, void 0, false, {
                                fileName: "[project]/components/filters/SkeletonLoader.tsx",
                                lineNumber: 19,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                className: "h-4 w-2/3 bg-gray-200 dark:bg-gray-700 rounded"
                            }, void 0, false, {
                                fileName: "[project]/components/filters/SkeletonLoader.tsx",
                                lineNumber: 20,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                className: "flex justify-between pt-2",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                        className: "h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded"
                                    }, void 0, false, {
                                        fileName: "[project]/components/filters/SkeletonLoader.tsx",
                                        lineNumber: 22,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
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
}),
"[project]/lib/useFavorites.ts [ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "useFavorites",
    ()=>useFavorites
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/react [external] (react, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$auth$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/auth.tsx [ssr] (ecmascript)");
;
;
function useFavorites() {
    const { token } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$auth$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__["useAuth"])();
    const getApiUrl = ()=>{
        if ("TURBOPACK compile-time truthy", 1) {
            return ("TURBOPACK compile-time value", "") || 'http://localhost:3001';
        }
        //TURBOPACK unreachable
        ;
        const hostname = undefined;
        const isLocalhost = undefined;
        const isProduction = undefined;
    };
    const toggleFavorite = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useCallback"])(async (eventId, wasFavorited)=>{
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
    }, [
        token
    ]);
    return {
        toggleFavorite
    };
}
}),
"[project]/components/FavoriteButton.tsx [ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "FavoriteButton",
    ()=>FavoriteButton
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/react/jsx-dev-runtime [external] (react/jsx-dev-runtime, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/react [external] (react, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$auth$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/auth.tsx [ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$useFavorites$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/useFavorites.ts [ssr] (ecmascript)");
;
;
;
;
const FavoriteButton = ({ eventId, initialFavorited = false, size = 'md', showLabel = false, className = '', onToggle })=>{
    const { user } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$auth$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__["useAuth"])();
    const { toggleFavorite } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$useFavorites$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__["useFavorites"])();
    const [isFavorited, setIsFavorited] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])(initialFavorited);
    const [isLoading, setIsLoading] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])(false);
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
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("span", {
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
            showLabel && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("span", {
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
}),
"[project]/lib/imageUtils.ts [ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getImageUrl",
    ()=>getImageUrl
]);
function getApiBaseUrl() {
    if ("TURBOPACK compile-time truthy", 1) {
        return ("TURBOPACK compile-time value", "") || 'http://localhost:3001';
    }
    //TURBOPACK unreachable
    ;
    const hostname = undefined;
}
function getImageUrl(imageUrl) {
    if (!imageUrl) return null;
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
        return imageUrl;
    }
    const apiBaseUrl = getApiBaseUrl();
    return `${apiBaseUrl}${imageUrl}`;
}
}),
"[project]/components/EventCard.tsx [ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>EventCard
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/react/jsx-dev-runtime [external] (react/jsx-dev-runtime, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$link$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/link.js [ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$FavoriteButton$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/FavoriteButton.tsx [ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$imageUtils$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/imageUtils.ts [ssr] (ecmascript)");
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
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
        className: "relative bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md dark:hover:shadow-gray-900/25 transition-shadow",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$link$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__["default"], {
                href: `/events/${event.id}`,
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                        className: "h-48 bg-gray-200 dark:bg-gray-700 flex items-center justify-center",
                        children: event.imageUrl ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("img", {
                            src: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$imageUtils$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__["getImageUrl"])(event.imageUrl) || '',
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
                        }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                            className: "text-gray-400 dark:text-gray-500 text-center",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                    className: "text-4xl mb-2",
                                    "aria-hidden": "true",
                                    children: "📅"
                                }, void 0, false, {
                                    fileName: "[project]/components/EventCard.tsx",
                                    lineNumber: 48,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
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
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                        className: "p-4",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                className: "flex items-center justify-between mb-2",
                                children: [
                                    event.category ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("span", {
                                        className: "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-white",
                                        style: {
                                            backgroundColor: event.category.color
                                        },
                                        children: event.category.name
                                    }, void 0, false, {
                                        fileName: "[project]/components/EventCard.tsx",
                                        lineNumber: 57,
                                        columnNumber: 15
                                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("span", {
                                        className: "text-xs text-gray-400 dark:text-gray-500",
                                        children: "Sin categoría"
                                    }, void 0, false, {
                                        fileName: "[project]/components/EventCard.tsx",
                                        lineNumber: 64,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("span", {
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
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("h3", {
                                className: "text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1 line-clamp-2",
                                children: event.title
                            }, void 0, false, {
                                fileName: "[project]/components/EventCard.tsx",
                                lineNumber: 71,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                className: "text-sm text-gray-600 dark:text-gray-400 mb-2",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                        className: "flex items-center mb-1",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("span", {
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
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                        className: "flex items-center",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("span", {
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
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                className: "flex items-center justify-between text-sm",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("span", {
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
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("span", {
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
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                className: "absolute top-2 right-2 z-10",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                    className: "flex items-center gap-1 bg-white/80 dark:bg-gray-800/80 rounded-full px-1",
                    children: [
                        event.favoriteCount !== undefined && event.favoriteCount > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("span", {
                            className: "text-xs text-red-400 font-medium",
                            title: "Favoritos",
                            children: event.favoriteCount
                        }, void 0, false, {
                            fileName: "[project]/components/EventCard.tsx",
                            lineNumber: 100,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$FavoriteButton$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__["FavoriteButton"], {
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
}),
"[project]/pages/events.tsx [ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "default",
    ()=>Events
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/react/jsx-dev-runtime [external] (react/jsx-dev-runtime, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/react [external] (react, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$Layout$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/Layout.tsx [ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$auth$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/auth.tsx [ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$useEventFilters$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/useEventFilters.ts [ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$queries$2f$useEvents$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/queries/useEvents.ts [ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$filters$2f$FilterBar$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/filters/FilterBar.tsx [ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$filters$2f$Pagination$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/filters/Pagination.tsx [ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$filters$2f$SkeletonLoader$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/filters/SkeletonLoader.tsx [ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$EventCard$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/EventCard.tsx [ssr] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$Layout$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$queries$2f$useEvents$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$Layout$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$queries$2f$useEvents$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
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
function Events() {
    const { token } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$auth$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__["useAuth"])();
    const { filters, setFilters, removeFilter, resetFilters, activeFilterCount } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$useEventFilters$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__["useEventFilters"])();
    const { data: response, isLoading, isFetching, error } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$queries$2f$useEvents$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__["useEvents"])(filters, token ?? undefined);
    const { data: metaResponse } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$queries$2f$useEvents$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__["useFiltersMeta"])();
    const events = response?.data ?? [];
    const pagination = response?.pagination;
    const meta = metaResponse?.data;
    const [favoriteUpdates, setFavoriteUpdates] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])({});
    const handleFavoriteToggle = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useCallback"])((eventId, nowFavorited)=>{
        setFavoriteUpdates((prev)=>{
            const event = events.find((e)=>e.id === eventId);
            const currentCount = favoriteUpdates[eventId]?.favoriteCount ?? event?.favoriteCount ?? 0;
            return {
                ...prev,
                [eventId]: {
                    isFavorited: nowFavorited,
                    favoriteCount: nowFavorited ? currentCount + 1 : Math.max(0, currentCount - 1)
                }
            };
        });
    }, [
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
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$Layout$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__["Layout"], {
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
            className: "px-4 sm:px-6 lg:px-8",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                    className: "sm:flex sm:items-center sm:justify-between",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("h1", {
                                className: "text-2xl font-bold text-gray-900 dark:text-gray-100",
                                children: "Eventos"
                            }, void 0, false, {
                                fileName: "[project]/pages/events.tsx",
                                lineNumber: 52,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("p", {
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
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                    className: "mt-6 md:grid md:grid-cols-[280px_1fr] lg:grid-cols-[320px_1fr] md:gap-6",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("aside", {
                            className: "md:sticky md:top-4 md:self-start",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$filters$2f$FilterBar$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__["default"], {
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
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                            className: "min-w-0",
                            children: [
                                error && !isLoading && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                    className: "text-center py-12",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                            className: "text-red-500 text-lg mb-2",
                                            children: "Error al cargar eventos"
                                        }, void 0, false, {
                                            fileName: "[project]/pages/events.tsx",
                                            lineNumber: 83,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("button", {
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
                                (isLoading || isFetching) && !error && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$filters$2f$SkeletonLoader$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__["default"], {
                                    count: filters.limit
                                }, void 0, false, {
                                    fileName: "[project]/pages/events.tsx",
                                    lineNumber: 97,
                                    columnNumber: 15
                                }, this),
                                !isLoading && !isFetching && !error && events.length === 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                    className: "text-center py-12",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                            className: "text-gray-500 dark:text-gray-400 text-lg",
                                            children: "No se encontraron eventos con estos filtros"
                                        }, void 0, false, {
                                            fileName: "[project]/pages/events.tsx",
                                            lineNumber: 103,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                            className: "text-gray-400 dark:text-gray-500 text-sm mt-2",
                                            children: activeFilterCount > 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("button", {
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
                                !isLoading && !error && events.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["Fragment"], {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                            className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6",
                                            children: events.map((event)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$EventCard$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__["default"], {
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
                                        pagination && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$filters$2f$Pagination$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__["default"], {
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
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__0-wddx~._.js.map