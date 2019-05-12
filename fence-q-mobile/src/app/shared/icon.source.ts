import { isAndroid } from "tns-core-modules/platform";

export function getIconSource(icon: string): string {
    const iconPrefix = isAndroid ? "res://" : "res://tabIcons/";

    return iconPrefix + icon;
}
