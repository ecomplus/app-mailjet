const sqlite = require('sqlite3')
const { appManager } = require('./mailjet')

const createDatabase = () => {
  const db = new sqlite.Database(process.env.ECOM_AUTH_DB, err => {
    if (err) {
      console.log(err)
    } else {
      db.run(`CREATE TABLE IF NOT EXISTS mailjet_app_settings (
        created_at        DATETIME DEFAULT (CURRENT_TIMESTAMP),
        id                INTEGER  NOT NULL
                                   PRIMARY KEY AUTOINCREMENT,
        list_id           INT,
        store_id          INTEGER  NOT NULL,
        authentication_id STRING,
        application_id    STRING   NOT NULL,
        setted_up         INTEGER  DEFAULT (0) 
      );`)

      db.run(`CREATE TABLE IF NOT EXISTS ecomplus_cart_watch (
        id            INTEGER  PRIMARY KEY AUTOINCREMENT
        NOT NULL,
        cart_id       STRING   NOT NULL,
        store_id      INTEGER  NOT NULL,
        created_at    DATETIME,
        customers_ids STRING   NOT NULL,
        send          INTEGER  DEFAULT (0) 
    );`)
    }
  })
}

createDatabase()

setInterval(appManager, 2 * 60 * 1000)
