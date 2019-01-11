/* const sqlite = require('sqlite3').verbose()
const path = require('path')
const fs = require('fs')
const dbPath = path.resolve(__dirname, config.BD_PATH)

const db = new sqlite.Database(dbPath)

db.serialize(async () => {
  if (!fs.existsSync(dbPath)) {
    let mailjet_app = `CREATE TABLE IF NOT EXISTS mailjet_app_settings (
      id         INTEGER  NOT NULL
                          PRIMARY KEY AUTOINCREMENT,
      created_at DATETIME DEFAULT (CURRENT_TIMESTAMP),
      list_id    INT,
      store_id   INTEGER  NOT NULL,
      setted_up  INTEGER  DEFAULT (0)
    );`
    db.run(mailjet_app)
  }
})
 */
const { appManager } = require('./mailjet')
appManager()
