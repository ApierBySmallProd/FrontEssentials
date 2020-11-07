import { Entity, EntityClass, HasOne, Id, Local, NoUpdate } from '../../../';

import RecipeBookEntity from './recipebook.entity';

@EntityClass({
  baseUrl: 'http://localhost:2000/recipe/',
  update: {
    method: 'POST',
    path: 'update/',
  },
  delete: {
    method: 'POST',
    path: 'delete/',
  },
  create: {
    method: 'PUT',
    path: 'create/',
  },
  findOne: {
    method: 'POST',
    path: 'getone/',
  },
  findAll: {
    method: 'POST',
    path: 'all/',
  },
})
export default class RecipeEntity extends Entity {
  @Id()
  @NoUpdate()
  public id: number;
  public calories: number;
  public carbs: string;
  public fat: string;
  public image: string;
  public imageType: string;
  public protein: string;
  public title: string;

  @HasOne('RecipeBookEntity')
  public book: RecipeBookEntity;

  @Local()
  public name: string;

  public constructor(
    calories: number,
    carbs: string,
    fat: string,
    image: string,
    imageType: string,
    protein: string,
    title: string,
  ) {
    super();
    this.calories = calories;
    this.carbs = carbs;
    this.fat = fat;
    this.image = image;
    this.imageType = imageType;
    this.protein = protein;
    this.title = title;
  }

  protected onCreate = () => {
    // Do whatever you want here
  };

  protected onDelete = () => {
    // Do whatever you want here
  };

  protected onGet = () => {
    // Do whatever you want here, this will be call after the entity has been retrieved from remote
  };

  protected onUpdate = () => {
    // Do whatever you want here
  };

  protected onRefresh = () => {
    // Do whatever you want here
  };

  protected onChange = () => {
    // Do whatever you want here
  };
}
