migrate((db) => {
  const collection = new Collection({
    "id": "btuetp74y5cuy8c",
    "created": "2025-02-04 14:55:53.782Z",
    "updated": "2025-02-04 14:55:53.782Z",
    "name": "instance_settings",
    "type": "base",
    "system": false,
    "schema": [
      {
        "system": false,
        "id": "tayqciyy",
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
        "id": "xribwvhp",
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
        "id": "wgaukcec",
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
  const collection = dao.findCollectionByNameOrId("btuetp74y5cuy8c");

  return dao.deleteCollection(collection);
})
