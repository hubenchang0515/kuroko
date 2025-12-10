import type React from "react";

const TypographyTypes = ["title", "subtitle", "text", "highlight", "weaken"] as const

export interface TitleProps extends React.HTMLAttributes<HTMLElement> {
    variant?: typeof TypographyTypes[number];
    children?: React.ReactNode
}

export default function Typography(props:TitleProps) {
    switch (props.variant) {
        case "title":
            return (
                <h1 {...props} className={props.className || "text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight bg-gradient-to-r from-[#39c5bb] to-[#66CCFF] bg-clip-text text-transparent drop-shadow-md"}
                >
                    {props.children}
                </h1>
            );

        case "subtitle":
            return (
                <p {...props} className={props.className || "text-2xl font-extrabold tracking-tight bg-gradient-to-r from-[#66CCFF] to-[#39c5bb] bg-clip-text text-transparent drop-shadow-md"}
                >
                    {props.children}
                </p>
            )

        case "highlight":
            return (
                <p {...props} className={props.className || "text-md sm:text-sm bg-gradient-to-r from-[#e91e63] to-[#d500f9] bg-clip-text text-transparent drop-shadow-md"}
                >
                    {props.children}
                </p>
            )

        case "weaken":
            return <p {...props} className={props.className || "text-xs sm:text-sm text-slate-500"}>{props.children}</p>

        default:
            return <p {...props} className={props.className || "text-md sm:text-sm"}>{props.children}</p>
    }
}