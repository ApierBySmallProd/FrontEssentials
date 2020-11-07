# Front essentials by SmallProd

## Presentation

This package has been created to easily manage data object on the frontend of a web application.

With this package you will be able to create entities representing the deferent objects you are using to communicate between your frontend and your backend. You will also be able to subscribe to some events on these entities to refresh your view whenever a specific events is triggered.

## Installation

You can easily install this package with npm or yarn like this:

```bash
yarn add @smallprod/frontessentials
```

or

```bash
npm install @smallprod/frontessentials
```

## Entity

### Defining your entities

The first thing you should do to use this package is to create some entities. There are two exemples in the folder **src/\_tests/entity/utils**, a Recipe entity and a BookRecipe entity.

As you can see on the **RecipeEntity** you must create a class witch extends the base class **Entity**. Then you should add the decorator **@EntityClass** on your entity to define some configurations.

After that, you can add the attributes to your entity. There are some decorators to configure those attributes:

- @Local which specifies an attribute which is computed in the front end (ie. the back end should not know about it) an attribute marked as local will not be sent in the request to Create or Update your entity.
- @Id which specifies that the attribute is the id of the entity. This attribute will be used to update and delete your entity. It's this attribute that you should use in the **getById()** method.
- @NoUpdate specifies that the attribute should not be updated. The attribute will not be sent in the request to Update your entity.
- @HasOne specifies that the attribute is another entity which is linked to this entity.
- @HasMany specified that the attribute is a list of another entity which is linked to this entity.

### Using your entities

Once you have down this, you can use the methods that we provide to manage your entities.

Here is the list:

- **getById(id: string, forceRefresh: boolean = false)** Get an entity by it's id. If the entity with the same Id has already been fetched, it will return it unless you put forceRefresh to true. This is a static function.
- **getAll(forceRefresh: boolean = false)** Get all entities. If at least one entity has already been fetched, it will not fetch other entities unless forceRefresh is set to true. This is a static function.
- **refresh()** Refresh an entity.
- **create()** Try to create the entity in the server.
- **update()** Try to update the entity in the server.
- **delete()** Try to delete the entity in the server.
- **clearEntityCache()** Delete the entity cache. This is a static method.

### Events on the entities

We also provide an event system to manage the entities.

There are three level of events. The local entity level which concern only a specific entity and which is handled directly in the entity class, the entity level which concern only a specific entity but which can be handled anywhere in your application and the entity class level which concern every entity of a specific type.

#### Local entity level

This level is the most basic one. In your entity class, you can override different methods:

- **onCreate()** which is called after the entity has been successfully created on the server
- **onUpdate()** which is called after the entity has been successfully updated on the server
- **onDelete()** which is called after the entity has been successfully deleted on the server
- **onRefresh()** which is called after the entity has been successfully refreshed from the server
- **onChange()** which is called whenever you call the method **change()** on the entity

#### Entity level

This level is more usefull as it allow you to track the change on a specific entity wherever you want in your application.

To register this kind of events, you should call the method **listen(type: string, func: Function)** on an instantiated entity.

You can also call the method **unListen(type: string, func: Function)** to unsubscribe to an event.

The events and the event handler method are descried here:

- **create**: **onCreate(entity: Entity)**
- **update**: **onUpdate(entity: Entity)**
- **delete**: **onDelete(entity: Entity)**
- **change**: **onChange(entity: Entity)**

These events are the same as the one on the local entity level.

#### Entity class level

This level can be very usefull if you are rendering a list of entity for exemple. You will want to update your view whenever a new entity is created or an entity is udpated, changed or deleted.

To register to this kind of events, you should call the static method **listenAll(type: string, func: Function)** on a class entity.

You can also call the method **unListenAll(type: string, func: Function)** to unsubscribe to an event.

The events and the event handler method are descried here:

- **create**: **onCreate(entity: Entity)**
- **update**: **onUpdate(entity: Entity)**
- **delete**: **onDelete(entity: Entity)**
- **change**: **onChange(entity: Entity)**

These events are the same as the one on the local entity level.

But there are two other events which are a little bit different:

- **listChange**: **onListChange(entities: Entity[])** which is called with the entire list of entity whenver any of those has been modified (create, update, delete, change, get).
- **get**: **onGet(entities: Entity[])** which is called when a get is called and a new entity is retrieved.
