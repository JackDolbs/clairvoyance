migrate((db) => {
  const collection = new Collection({
    "id": "bpnndmuox30mq46",
    "created": "2025-02-04 15:30:43.031Z",
    "updated": "2025-02-04 15:30:43.031Z",
    "name": "instance_settings",
    "type": "base",
    "system": false,
    "schema": [
      {
        "system": false,
        "id": "vhnrikll",
        "name": "instance_name",
        "type": "text",
        "required": false,
        "unique": false,
        "options": {
          "min": null,
          "max": null,
          "pattern": ""
        }
      },
      {
        "system": false,
        "id": "jswx3mek",
        "name": "instance_url",
        "type": "text",
        "required": false,
        "unique": false,
        "options": {
          "min": null,
          "max": null,
          "pattern": ""
        }
      },
      {
        "system": false,
        "id": "2khzgauj",
        "name": "theme",
        "type": "json",
        "required": false,
        "unique": false,
        "options": {}
      }
    ],
    "indexes": [],
    "listRule": null,
    "viewRule": null,
    "createRule": null,
    "updateRule": null,
    "deleteRule": null,
    "options": {}
  });

  return Dao(db).saveCollection(collection);
}, (db) => {
  const dao = new Dao(db);
  const collection = dao.findCollectionByNameOrId("bpnndmuox30mq46");

  return dao.deleteCollection(collection);
})
