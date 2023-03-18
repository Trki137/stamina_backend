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

  static async follow(followed, followedBy) {
    if (!(await this.checkUser(followed))) return null;
    if (!(await this.checkUser(followedBy))) return null;

    const query = "INSERT INTO follows VALUES ($1,$2)";

    try {
      const result = await db.query(query, [followedBy, followed]);
      console.log(result);
      return result.rowCount > 0 ? result : null;
    } catch (e) {
      console.log(e);
      return null;
    }
  }

  static async unfollow(followed, followedBy) {
    if (!(await this.checkUser(followed))) return null;
    if (!(await this.checkUser(followedBy))) return null;

    const query =
      "DELETE FROM follows WHERE userid = $1 AND follow_userid = $2";

    try {
      const result = await db.query(query, [followedBy, followed]);
      console.log(result);
      return result.rowCount > 0 ? result : null;
    } catch (e) {
      console.log(e);
      return null;
    }
  }

  static async checkUser(userId) {
    let query = "SELECT * FROM users WHERE userId = $1";

    try {
      let result = await db.query(query, [userId]);
      console.log(userId);
      console.log(result);
      if (result.rowCount === 0) return null;
      return result;
    } catch (e) {
      return null;
    }
  }

  static async getOtherUsers(id) {
    const query = `
            SELECT username,
                   userid,
                   image,
                   (SELECT COUNT(*) FROM follows where follows.follow_userid = users.userid) as followedBy,
                   (SELECT COUNT(*)
                    FROM follows
                    where follows.userid = $1
                      AND follows.follow_userid = users.userid)                              as isfollowing
            FROM users
            where userid <> $1
        `;

    try {
      const result = await db.query(query, [id]);

      return result.rowCount > 0 ? result.rows : null;
    } catch (e) {
      console.log(e);
    }
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
