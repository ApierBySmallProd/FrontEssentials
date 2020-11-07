# Changelog

## V1.1.0

### ADD

- Relationships
  - HasOne
    - An entity has zero or one other entity linked to it. This other entity will be created or retrieved on get and and get all
  - HasMany
    - An entity has zero or many other entities linked to it. Theses other entities will be created or retrieved on get and get all.
  - Linked entities are not affected by Create, Update and Delete operations on the parent entity.
- README created and filled

## V1.0.0

### ADD

- Parent Entity
  - CRUD
    - getAll
    - getById
    - create
    - update
    - delete
    - refresh
  - Cache
    - cache entities depending their id
  - Events
    - Global
      - create
      - update
      - delete
      - change
      - listChange
      - get
  - Local
    - create
    - update
    - delete
    - change
  - Callback in entity
    - onCreate
    - onDelete
    - onUpdate
    - onGet
    - onRefresh
    - onChange
  - Force the refresh if needed
  - Change locally and send event for some update in the entity
- Decorators
  - Local
  - Id
  - NoUpdate
  - EntityClass
    - Options
      - baseUrl
      - create, update, delete, findAll, findOne with:
        - method
        - path
- AjaxRequest
  - static sendRequest
    - parameters
      - method: POST, GET, DELETE, PATCH, PUT
      - url
      - data (only json)
      - headers
    - response
      - null or
      - Response
        - statusCode
        - data (already parsed from json)
        - headers
