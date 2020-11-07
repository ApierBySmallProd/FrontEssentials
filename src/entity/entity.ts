import AjaxRequest from '../ajaxrequest';
import { EntityClassOptions } from './decorators';

interface SingleEntityEvents {
  create: Entity;
  update: Entity;
  delete: Entity;
  change: Entity;
}

interface AllEntityEvents {
  create: Entity;
  update: Entity;
  delete: Entity;
  change: Entity;
  listChange: Entity[];
  get: Entity[];
}

type EventKey<T> = string & keyof T;
type EventHandler<T> = (params: T) => void;

interface EntityClass {
  name: string;
  class: any;
  entities: Entity[] | null;
  events: { [K in keyof AllEntityEvents]?: Array<(p: AllEntityEvents[K]) => void> };
}

export interface Association {
  attributeName: string;
  type: 'one' | 'many';
  entityName: string;
}

export default abstract class Entity {
  public [Symbol.toStringTag] = 'Entity';
  public static entityClasses: EntityClass[] = [];
  public static className: string;
  private static localAttributes: string[];
  private static idAttribute: string;
  private static noUpdateAttributes: string[];
  private static associations: Association[];
  public static newEntity = (): any => null;
  public static options: EntityClassOptions;
  public events: { [K in keyof SingleEntityEvents]?: Array<(p: SingleEntityEvents[K]) => void> } = {};
  private static entities: Entity[] | null = null;

  private static fromRequest(data: any, forceRefresh: boolean) {
    const cachedEntities = Entity.entityClasses.find((e) => e.name === this.className)?.entities;
    let entity: any = cachedEntities
      ? cachedEntities.find((entity) => entity[this.idAttribute] === data[this.idAttribute])
      : null;

    if (forceRefresh || !entity) {
      entity = this.newEntity();
      entity.fromRequest(data, forceRefresh);
      entity.onGet();
    }

    return entity;
  }

  public static async getById(id: any, forceRefresh = false) {
    const cachedEntities = Entity.entityClasses.find((e) => e.name === this.className)?.entities;
    let entity: any = cachedEntities ? cachedEntities.find((entity) => entity[this.idAttribute] === id) : null;
    if (forceRefresh || !entity) {
      entity = this.newEntity();
      entity[this.idAttribute] = id;
      entity = await entity.refresh(true);
    }
    return entity;
  }

  public static async getAll(forceRefresh = false) {
    const cachedEntities = Entity.entityClasses.find((e) => e.name === this.className)?.entities;
    if (forceRefresh || cachedEntities === null) {
      const response = await AjaxRequest.sendRequest(
        this.options.findAll?.method || 'GET',
        `${this.options.baseUrl}${this.options.findAll?.path || ''}`,
      );
      if (response && response.statusCode === 200) {
        const entities: Entity[] = response.data.map((data: any) => this.fromRequest(data, true));
        this.emitAll('get', entities);
        this.cache(entities);
        const classEntity = Entity.entityClasses.find((e) => e.name === this.className);
        if (classEntity && classEntity.entities) {
          this.emitAll('listChange', classEntity.entities);
        }
        return entities;
      }
      return null;
    }
    return cachedEntities;
  }

  public async refresh(getEvent = false) {
    const base = this as any;
    const options: EntityClassOptions = base.constructor.options;
    const response = await AjaxRequest.sendRequest(
      options.findOne?.method || 'GET',
      `${options.baseUrl}${options.findOne?.path || ''}${base[base.constructor.idAttribute]}`,
    );
    if (response && response.statusCode === 200) {
      this.fromRequest(response.data);
      base.constructor.emitAll('get', [this]);
      base.constructor.cache([this]);
      if (getEvent) {
        this.onGet();
      } else {
        this.onRefresh();
      }
      const classEntity = Entity.entityClasses.find((e) => e.name === base.constructor.className);
      base.constructor.emitAll('listChange', classEntity?.entities);
      return this;
    }
    return null;
  }

  public async create() {
    const base = this as any;
    const localAttributes: string[] = base.constructor.localAttributes ?? [];
    const requestData: any = {};
    for (const [key, value] of Object.entries(this)) {
      if (!localAttributes.includes(key) && base.constructor.idAttribute !== key && !['events'].includes(key)) {
        if (typeof base[key] !== 'function') {
          requestData[key] = value;
        }
      }
    }
    const options: EntityClassOptions = base.constructor.options;
    const response = await AjaxRequest.sendRequest(
      options.create?.method || 'POST',
      `${options.baseUrl}${options.create?.path || ''}`,
      requestData,
    );
    if (response && response.statusCode === 200) {
      this.fromRequest(response.data);
      this.emit('create', this);
      base.constructor.emitAll('create', this);
      base.constructor.cache([this]);
      this.onCreate();
      const classEntity = Entity.entityClasses.find((e) => e.name === base.constructor.className);
      base.constructor.emitAll('listChange', classEntity?.entities);
      return this;
    }
    return null;
  }

  public async update() {
    const base = this as any;
    const localAttributes: string[] = base.constructor.localAttributes ?? [];
    const noUpdateAttributes: string[] = base.constructor.noUpdateAttributes ?? [];
    const requestData: any = {};
    for (const [key, value] of Object.entries(this)) {
      if (!localAttributes.includes(key) && !noUpdateAttributes.includes(key) && !['events'].includes(key)) {
        if (typeof base[key] !== 'function') {
          requestData[key] = value;
        }
      }
    }
    const options: EntityClassOptions = base.constructor.options;

    const response = await AjaxRequest.sendRequest(
      options.update?.method || 'PATCH',
      `${options.baseUrl}${options.update?.path || ''}${base[base.constructor.idAttribute]}`,
      requestData,
    );
    if (response && response.statusCode === 200) {
      this.fromRequest(response.data);
      this.emit('update', this);
      this.onUpdate();
      base.constructor.emitAll('update', this);
      base.constructor.cache([this]);
      const classEntity = Entity.entityClasses.find((e) => e.name === base.constructor.className);
      base.constructor.emitAll('listChange', classEntity?.entities);
      return this;
    }
    return null;
  }

  public async delete() {
    const base = this as any;
    const options: EntityClassOptions = base.constructor.options;
    const response = await AjaxRequest.sendRequest(
      options.delete?.method || 'DELETE',
      `${options.baseUrl}${options.delete?.path || ''}${base[base.constructor.idAttribute]}`,
    );
    if (response && response.statusCode === 200) {
      this.emit('delete', this);
      this.onDelete();
      base.constructor.emitAll('delete', this);
      base.constructor.unCache(this);
      const classEntity = Entity.entityClasses.find((e) => e.name === base.constructor.className);
      base.constructor.emitAll('listChange', classEntity?.entities);
      return true;
    }
    return false;
  }

  private fromRequest = (data: any) => {
    const base = this as any;
    const associations: Association[] = base.constructor.associations;
    const entityClasses: EntityClass[] = base.constructor.entityClasses;
    for (const [key, value] of Object.entries(data)) {
      const association = associations.find((a) => a.attributeName === key);
      if (association) {
        const associatedEntity = entityClasses.find((e) => e.name === association.entityName);
        if (associatedEntity) {
          if (association.type === 'one') {
            this[key] = associatedEntity.class.fromRequest(value);
          } else {
            if (value instanceof Array) {
              this[key] = value.map((v) => associatedEntity.class.fromRequest(v, false));
            } else {
              console.error('Not an array');
            }
          }
        }
      } else {
        this[key] = value;
      }
    }
  };

  public listen<K extends EventKey<SingleEntityEvents>>(type: K, func: EventHandler<SingleEntityEvents[K]>) {
    let temp: any = this.events[type] || [];
    temp = temp?.concat(func);
    this.events[type] = temp;
  }

  public unListen<K extends EventKey<SingleEntityEvents>>(type: K, func: EventHandler<SingleEntityEvents[K]>) {
    let temp = this.events[type] || [];
    temp = temp?.filter((f) => f !== func);
    this.events[type] = temp;
  }

  public clearListeners = () => {
    this.events = {};
  };

  public change = () => {
    this.onChange();
    this.emit('change', this);
    const base = this as any;
    base.constructor.emitAll('change', this);
    const classEntity = Entity.entityClasses.find((e) => e.name === base.constructor.className);
    base.constructor.emitAll('listChange', classEntity?.entities);
  };

  protected emit<K extends EventKey<SingleEntityEvents>>(type: K, params: SingleEntityEvents[K]) {
    let temp = this.events[type] || [];
    temp?.forEach((func) => {
      func(params);
    });
  }

  public static listenAll<K extends EventKey<AllEntityEvents>>(type: K, func: EventHandler<AllEntityEvents[K]>) {
    const entityClass = Entity.entityClasses.find((e) => e.name === this.className);
    if (!entityClass) return;
    let temp: any = entityClass.events[type] || [];
    temp = temp?.concat(func);
    entityClass.events[type] = temp;
  }

  public static unListenAll<K extends EventKey<AllEntityEvents>>(type: K, func: EventHandler<AllEntityEvents[K]>) {
    const entityClass = Entity.entityClasses.find((e) => e.name === this.className);
    if (!entityClass) return;
    let temp: any = entityClass.events[type] || [];
    temp = temp?.filter((f) => f !== func);
    entityClass.events[type] = temp;
  }

  public static clearAllListeners() {
    const entityClass = Entity.entityClasses.find((e) => e.name === this.className);
    if (!entityClass) return;
    entityClass.events = {};
  }

  protected static emitAll<K extends EventKey<AllEntityEvents>>(type: K, params: AllEntityEvents[K]) {
    const entityClass = Entity.entityClasses.find((e) => e.name === this.className);
    if (!entityClass) return;
    let temp: any = entityClass.events[type] || [];
    temp?.forEach((func) => {
      func(params);
    });
  }

  private static cache(entities: Entity[]) {
    const entityClass = Entity.entityClasses.find((e) => e.name === this.className);
    if (!entityClass) return;
    let cachedEntities = entityClass.entities;
    let toTreat = entities;
    if (!cachedEntities) cachedEntities = [];
    cachedEntities.forEach((entity, index) => {
      let newEntity = toTreat.find((e) => e[this.idAttribute] === entity[this.idAttribute]);
      if (newEntity) {
        cachedEntities?.splice(index, 1, newEntity);
        toTreat = toTreat.filter((e) => e[this.idAttribute] !== entity[this.idAttribute]);
      }
    });
    cachedEntities.push(...toTreat);
    entityClass.entities = cachedEntities;
  }

  private static unCache(entity: Entity) {
    const entityClass = Entity.entityClasses.find((e) => e.name === this.className);
    if (!entityClass) return;
    let cachedEntities = entityClass.entities;
    if (!cachedEntities) cachedEntities = [];
    cachedEntities = cachedEntities.filter((e) => e[this.idAttribute] !== entity[this.idAttribute]);
    entityClass.entities = cachedEntities;
  }

  public static clearEntityCache() {
    const entityClass = Entity.entityClasses.find((e) => e.name === this.className);
    if (!entityClass) return;
    entityClass.entities = null;
  }

  protected onCreate = (): any => null;
  protected onDelete = (): any => null;
  protected onUpdate = (): any => null;
  protected onGet = (): any => null;
  protected onRefresh = (): any => null;
  protected onChange = (): any => null;
}
