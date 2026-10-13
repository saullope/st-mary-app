import { readSessionClaims } from "./session";

// Returns decoded user from session cookie, or null if invalid, expired or past the absolute limit
const getSession = async () => readSessionClaims();

export default getSession;
