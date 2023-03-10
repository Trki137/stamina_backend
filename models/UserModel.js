const db = require("../db/db.js");
const bcrypt = require("bcrypt");
module.exports = class UserModel {
    constructor(username, email, password, imageURL, description) {
        this.username = username;
        this.email = email;
        this.imageURL = imageURL;
        this.description = description;
        this.password = password;
    }

    static async checkEmail(email) {
        const query = `SELECT *
                       FROM users
                       WHERE email = $1`;

        try {
            const result = await db.query(query, [email]);

            if (result.rowCount > 0) return `Email ${email} already exists`;
            return null;
        } catch (e) {
            console.log(e);
        }
    }

    static async checkUsername(username) {
        const query = `SELECT *
                       FROM users
                       WHERE username = $1`;

        try {
            const result = await db.query(query, [username]);

            if (result.rowCount > 0) return `Username ${username} is taken`;
            return null;
        } catch (e) {
            console.log(e);
        }
    }

    static async checkUsernameExists(username) {
        const query = `SELECT *
                       FROM users
                       WHERE username = $1`;

        try {
            const result = await db.query(query, [username]);

            return result.rowCount !== 1
                ? `Username ${username} does not exists`
                : null;
        } catch (e) {
            console.log(e);
        }
    }

    async signin() {
        const query = `SELECT *
                       FROM users
                       WHERE username = $1`;
        let result;
        try {
            result = await db.query(query, [this.username]);
        } catch (e) {
            console.log(e);
        }
        const success = await bcrypt.compare(
            this.password,
            result.rows[0].password
        );

        return success ? result.rows[0] : "Password doesn't match";
    }

    async signup() {
        const query = `INSERT INTO users (username, email, password, description, image)
                       VALUES ($1, $2, $3, $4, $5)`;

        try {
            await bcrypt.hash(this.password, 10, async (err, hash) => {
                return await db.query(query, [
                    this.username,
                    this.email,
                    hash,
                    this.description,
                    this.imageURL,
                ]);
            });
        } catch (e) {
            console.log(e);
        }
    }
};
