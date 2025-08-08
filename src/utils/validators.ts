export const nameValid = (name: string) => {
    return typeof name === "string" && name.trim().length >= 20 && name.trim().length <= 60;
};

export const addressValid = (address?: string) => {
    if (!address) return true;
    return typeof address === "string" && address.length <= 400;
};

export const passwordValid = (password: string) => {
    // 8-16 chars, at least one uppercase and one special character
    const re = /^(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,16}$/;
    return re.test(password);
};

export const emailValid = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
};
