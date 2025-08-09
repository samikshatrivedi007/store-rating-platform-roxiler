export function nameValid(name: string): boolean {
    return typeof name === "string" && name.trim().length >= 2;
}

export function passwordValid(password: string): boolean {
    return typeof password === "string" && password.length >= 6;
}

export function emailValid(email: string): boolean {
    return /\S+@\S+\.\S+/.test(email);
}

export function addressValid(address: string): boolean {
    return typeof address === "string" && address.trim().length > 5;
}
