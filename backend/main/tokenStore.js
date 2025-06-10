// temp/tokenStore.js
import fs from 'fs';
import path from 'path';

const tokenPath = path.resolve('./google_token.txt');
import { tokensUsers } from '../database/tokens.js';

export function saveToken(token) {
    fs.writeFileSync(tokenPath, token, 'utf8');
    console.log("Token saved to file.");
}

export function getToken() {
    if (fs.existsSync(tokenPath)) {
        return fs.readFileSync(tokenPath, 'utf8');
    }
    return null;
}

export function deleteToken() {
    if (fs.existsSync(tokenPath)) {
        fs.unlinkSync(tokenPath);
        console.log("Token deleted from file.");
    }
}
