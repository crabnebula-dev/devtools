export const sanitizeString = (maybeString: string | number) => {
    if (typeof maybeString === "string") return maybeString.charCodeAt(0);
    return maybeString;
};