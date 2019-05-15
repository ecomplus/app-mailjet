{
  "definitions": {},
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "http://example.com/root.json",
  "type": "object",
  "title": "The Root Schema",
  "required": [
    "data",
    "hidden_data"
  ],
  "properties": {
    "data": {
      "$id": "#/properties/data",
      "type": "object",
      "title": "The Data Schema",
      "required": [
        "maillist",
        "is_abandoned"
      ],
      "properties": {
        "maillist": {
          "$id": "#/properties/data/properties/maillist",
          "type": "object",
          "title": "The Maillist Schema",
          "required": [
            "default"
          ],
          "properties": {
            "default": {
              "$id": "#/properties/data/properties/maillist/properties/default",
              "type": "integer",
              "title": "The Default Schema",
              "default": 0,
              "examples": [
                1234
              ]
            }
          }
        },
        "is_abandoned": {
          "$id": "#/properties/data/properties/is_abandoned",
          "type": "integer",
          "title": "The Is_abandoned Schema",
          "default": 0,
          "examples": [
            2
          ]
        }
      }
    },
    "hidden_data": {
      "$id": "#/properties/hidden_data",
      "type": "object",
      "title": "The Hidden_data Schema",
      "required": [
        "mailjet_key",
        "mailjet_secret",
        "mailjet_from",
        "mailjet_templates"
      ],
      "properties": {
        "mailjet_key": {
          "$id": "#/properties/hidden_data/properties/mailjet_key",
          "type": "string",
          "title": "The Mailjet_key Schema",
          "default": "",
          "examples": [
            "ZRsLkJs5XWOz9odJsUecaHEYWEj0Tdln1KuZV0kbuo9fDV"
          ],
          "pattern": "^(.*)$"
        },
        "mailjet_secret": {
          "$id": "#/properties/hidden_data/properties/mailjet_secret",
          "type": "string",
          "title": "The Mailjet_secret Schema",
          "default": "",
          "examples": [
            "IcpezUIwlarsr75zaaQdovM4ZT0kw8W5jM6hl5x97zR9Y"
          ],
          "pattern": "^(.*)$"
        },
        "mailjet_from": {
          "$id": "#/properties/hidden_data/properties/mailjet_from",
          "type": "object",
          "title": "The Mailjet_from Schema",
          "required": [
            "name",
            "email"
          ],
          "properties": {
            "name": {
              "$id": "#/properties/hidden_data/properties/mailjet_from/properties/name",
              "type": "string",
              "title": "The Name Schema",
              "default": "",
              "examples": [
                "Talisson"
              ],
              "pattern": "^(.*)$"
            },
            "email": {
              "$id": "#/properties/hidden_data/properties/mailjet_from/properties/email",
              "type": "string",
              "title": "The Email Schema",
              "default": "",
              "examples": [
                "talissonf@gmail.com"
              ],
              "pattern": "^(.*)$"
            }
          }
        },
        "mailjet_templates": {
          "$id": "#/properties/hidden_data/properties/mailjet_templates",
          "type": "array",
          "title": "The Mailjet_templates Schema",
          "items": {
            "$id": "#/properties/hidden_data/properties/mailjet_templates/items",
            "type": "object",
            "title": "The Items Schema",
            "required": [
              "trigger",
              "id"
            ],
            "properties": {
              "trigger": {
                "$id": "#/properties/hidden_data/properties/mailjet_templates/items/properties/trigger",
                "type": "string",
                "title": "The Trigger Schema",
                "default": "",
                "examples": [
                  "order_confirmation"
                ],
                "pattern": "^(.*)$"
              },
              "id": {
                "$id": "#/properties/hidden_data/properties/mailjet_templates/items/properties/id",
                "type": "integer",
                "title": "The Id Schema",
                "default": 0,
                "examples": [
                  588725
                ]
              }
            }
          }
        }
      }
    }
  }
}