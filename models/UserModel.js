const db = require("../db/db.js");
const bcrypt = require("bcrypt");
module.exports = class UserModel {
  constructor(
    firstname,
    lastname,
    username,
    email,
    password,
    imageURL,
    description
  ) {
    this.firstname = firstname;
    this.lastname = lastname;
    this.username = username;
    this.email = email;
    this.imageURL = imageURL;
    this.description = description;
    this.password = password;
  }

  static async getImage(id) {
    const query = `SELECT image
                       FROM users
                       WHERE userid = $1`;

    try {
      const result = await db.query(query, [id]);

      return result.rowCount > 0 ? result.rows[0].image : null;
    } catch (e) {
      console.log(e);
      return null;
    }
  }

  static async getFollowers(id) {
    const query = `SELECT users.userid,
                              username,
                              concat(firstname, ' ', lastname) as name,
                              image
                       FROM users
                                INNER JOIN follows ON follows.userid = users.userid
                       where follows.userid <> $1
                         AND follows.follow_userid = $1`;

    try {
      return (await db.query(query, [id])).rows;
    } catch (e) {
      console.log(e);
      return null;
    }
  }

  static async getFollowing(id) {
    const query = `SELECT users.userid,
                              username,
                              concat(firstname, ' ', lastname) as name,
                              image
                       FROM users
                                INNER JOIN follows ON follows.follow_userid = users.userid
                       where follows.userid = $1`;

    try {
      return (await db.query(query, [id])).rows;
    } catch (e) {
      console.log(e);
      return null;
    }
  }

  static async getProfile(id, currentUserId) {
    const query = `SELECT username,
                              email,
                              description,
                              image,
                              concat(firstname, ' ', lastname)                                   as name,
                              (SELECT COUNT(*) from follows where follows.userid = users.userid) as numOfFollowing,
                              (SELECT COUNT(*)
                               from follows
                               where follows.follow_userid = users.userid)                       as numOfFollowers,
                              (SELECT userid
                               from follows
                               where follows.userid = $1
                                 and follows.follow_userid = $2)                                 as isFollowing
                       FROM users
                       where userid = $2`;

    try {
      const result = await db.query(query, [currentUserId, id]);

      return result.rowCount > 0 ? result.rows[0] : null;
    } catch (e) {
      console.log(e);
      return null;
    }
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
                   concat(firstname, ' ', lastname)                                          as name,
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

  async update(id) {
    const query = `UPDATE users
                       SET username    = $1,
                           email       = $2,
                           firstname   = $3,
                           lastname    = $4,
                           description = $5,
                           image       = $6
                       WHERE userid = $7
        `;

    try {
      return await db.query(query, [
        this.username,
        this.email,
        this.firstname,
        this.lastname,
        this.description,
        this.imageURL,
        id,
      ]);
    } catch (err) {
      console.log(err);
      return null;
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
    console.log(this.password);
    console.log(this.username);
    console.log(result);
    const success = await bcrypt.compare(
      this.password,
      result.rows[0].password
    );

    return success ? result.rows[0] : "Password doesn't match";
  }

  async signup() {
    const query = `INSERT INTO users
                           (username, email, password, description, image, firstname, lastname)
                       VALUES ($1, $2, $3, $4, $5, $6, $7)`;

    try {
      await bcrypt.hash(this.password, 10, async (err, hash) => {
        return await db.query(query, [
          this.username,
          this.email,
          hash,
          this.description,
          this.imageURL,
          this.firstname,
          this.lastname,
        ]);
      });
    } catch (e) {
      console.log(e);
    }
  }
};
