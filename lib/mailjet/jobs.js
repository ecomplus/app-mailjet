const sqlite = require('sqlite3')
const { appManager } = require('./mailjet')

const createDatabase = () => {
  const db = new sqlite.Database(process.env.ECOM_AUTH_DB, err => {
    if (err) {
      console.log(err)
    } else {
      db.run(`CREATE TABLE IF NOT EXISTS mailjet_app_settings (
        created_at     DATETIME DEFAULT (CURRENT_TIMESTAMP),
        id             INTEGER  NOT NULL
                                PRIMARY KEY AUTOINCREMENT,
        list_id        INT,
        store_id       INTEGER  NOT NULL,
        application_id STRING   NOT NULL,
        setted_up      INTEGER  DEFAULT (0)
        );`)
    }
  })
}

createDatabase()

setInterval(appManager, 2 * 60 * 1000)
