import { useEffect, useRef } from "react";
import VanillaTilt, { HTMLVanillaTiltElement } from "vanilla-tilt";

export function useTilt(options = {}) {
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const el = ref.current as HTMLVanillaTiltElement | null;
        if (!el) return;

        VanillaTilt.init(el, options);

        return () => {
            el.vanillaTilt?.destroy();
        };
    }, [options]);

    return ref;
}
