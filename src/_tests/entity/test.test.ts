import RecipeBookEntity from './utils/recipebook.entity';
import RecipeEntity from './utils/recipe.entity';
import { expect as chaiexp } from 'chai';
import mock from '../_config/mock';

describe('Entities', () => {
  describe('Entity configuration', () => {
    beforeAll(() => {
      new RecipeEntity(100, '', '', '', '', '', '');
      new RecipeBookEntity();
    });

    test('Entity remote configuration', () => {
      chaiexp(RecipeEntity.options.baseUrl).equal('http://localhost:2000/recipe/');

      chaiexp(RecipeEntity.options.update?.method).equal('POST');
      chaiexp(RecipeEntity.options.update?.path).equal('update/');

      chaiexp(RecipeEntity.options.delete?.method).equal('POST');
      chaiexp(RecipeEntity.options.delete?.path).equal('delete/');

      chaiexp(RecipeEntity.options.create?.method).equal('PUT');
      chaiexp(RecipeEntity.options.create?.path).equal('create/');

      chaiexp(RecipeEntity.options.findOne?.method).equal('POST');
      chaiexp(RecipeEntity.options.findOne?.path).equal('getone/');

      chaiexp(RecipeEntity.options.findAll?.method).equal('POST');
      chaiexp(RecipeEntity.options.findAll?.path).equal('all/');
    });

    test('Entity global configuration', () => {
      const entity: any = RecipeEntity;
      chaiexp(entity.entities).equal(null);
    });
  });

  describe('Crud operations', () => {
    afterEach(() => {
      mock.ajaxRequest.unMock();
      RecipeEntity.clearAllListeners();
      RecipeEntity.clearEntityCache();
    });
    describe('Get', () => {
      test('Get all', async () => {
        const recipes = await RecipeEntity.getAll();
        chaiexp(recipes).to.be.an('array');

        chaiexp(recipes?.length).equal(2);
      });

      test('Get one', async () => {
        const recipe = await RecipeEntity.getById(716429);
        chaiexp(recipe).not.to.be.null;
      });

      test('Get one fail', async () => {
        const recipe = await RecipeEntity.getById(124);
        chaiexp(recipe).to.be.null;
      });

      test('Get one with many relations', async () => {
        const book: RecipeBookEntity = await RecipeBookEntity.getById(125);

        chaiexp(book).not.to.be.null;
        chaiexp(book).to.be.an('Entity');
        chaiexp(book.recipes).to.be.an('array');
        chaiexp(book.recipes.length).to.be.equal(2);
        chaiexp(book.recipes[0]).to.be.an('Entity');
      });

      test('Get one with one relation', async () => {
        const recipe: RecipeEntity = await RecipeEntity.getById(715538);

        chaiexp(recipe).not.to.be.null;
        chaiexp(recipe.book).not.to.be.null;
        chaiexp(recipe.book).to.be.an('Entity');
      });

      test('Ajax', async () => {
        // Let's mock AjaxRequest
        const ajaxRequestMock = mock.ajaxRequest.withValue(null);

        await RecipeEntity.getById(716429);

        chaiexp(ajaxRequestMock.mock.calls.length).to.be.eq(1);
        const lastCall: any = ajaxRequestMock.mock.calls[0];
        chaiexp(lastCall[0]).to.be.eq('POST');
        chaiexp(lastCall[1]).to.be.eq(`http://localhost:2000/recipe/getone/${716429}`);

        await RecipeEntity.getAll();

        chaiexp(ajaxRequestMock.mock.calls.length).to.be.eq(2);
        const lastCall2: any = ajaxRequestMock.mock.calls[1];
        chaiexp(lastCall2[0]).to.be.eq('POST');
        chaiexp(lastCall2[1]).to.be.eq(`http://localhost:2000/recipe/all/`);
      });

      test('Cache', async () => {
        const recipes = await RecipeEntity.getAll();
        chaiexp(recipes).not.to.be.null;
        // Let's mock AjaxRequest
        const ajaxRequestMock = mock.ajaxRequest.withValue(null);
        let sameRecipe = await RecipeEntity.getById(716429);
        chaiexp(sameRecipe).not.to.be.null;
        chaiexp(ajaxRequestMock.mock.calls.length).to.be.eq(0);
        let sameRecipes = await RecipeEntity.getAll();
        chaiexp(sameRecipes?.length).to.be.equal(2);
        chaiexp(ajaxRequestMock.mock.calls.length).to.be.eq(0);

        sameRecipe = await RecipeEntity.getById(716429, true);
        chaiexp(sameRecipe).to.be.null;
        chaiexp(ajaxRequestMock.mock.calls.length).to.be.eq(1);
      });

      test('Event', async () => {
        const getEvent = jest.fn(() => null);
        RecipeEntity.listenAll('get', getEvent);
        let _ = await RecipeEntity.getAll();
        chaiexp(getEvent.mock.calls.length).to.be.eq(1);
        _ = await RecipeEntity.getAll();
        chaiexp(getEvent.mock.calls.length).to.be.eq(1); // There's cache here so no update
        _ = await RecipeEntity.getAll(true);
        chaiexp(getEvent.mock.calls.length).to.be.eq(2); // Force refresh
        RecipeEntity.unListenAll('get', getEvent);
        _ = await RecipeEntity.getAll(true);
        chaiexp(getEvent.mock.calls.length).to.be.eq(2);
        RecipeEntity.listenAll('get', getEvent);
        const recipe = await RecipeEntity.getById(716429, true);
        chaiexp(recipe).not.to.be.null;
        chaiexp(getEvent.mock.calls.length).to.be.eq(3);
        const lastCall: any = getEvent.mock.calls[2];
        chaiexp(lastCall[0]).to.be.an('array');
        chaiexp(lastCall[0].length).to.be.eq(1);
        chaiexp(lastCall[0]).to.contains(recipe);
      });
    });

    describe('Create', () => {
      test('Create', async () => {
        const recipe = new RecipeEntity(100, '', '', '', '', '', '');
        let createdRecipe = await recipe.create();
        chaiexp(createdRecipe).to.not.be.null;
        chaiexp(createdRecipe?.id).to.be.eq(716428);
      });

      test('Ajax', async () => {
        const recipe = new RecipeEntity(100, '10g', '12g', 'image', 'png', '15g', 'my title');

        // Let's mock AjaxRequest
        const ajaxRequestMock = mock.ajaxRequest.withValue(null);

        const _ = await recipe.create();

        chaiexp(ajaxRequestMock.mock.calls.length).to.be.eq(1);
        const lastCall: any = ajaxRequestMock.mock.calls[0];
        chaiexp(lastCall[0]).to.be.eq('PUT');
        chaiexp(lastCall[1]).to.be.eq(`http://localhost:2000/recipe/create/`);
        chaiexp(lastCall[2]).to.be.deep.eq({
          calories: recipe.calories,
          carbs: recipe.carbs,
          fat: recipe.fat,
          image: recipe.image,
          imageType: recipe.imageType,
          title: recipe.title,
          protein: recipe.protein,
        });
      });

      test('Cache', async () => {
        const recipe = new RecipeEntity(100, '', '', '', '', '', '');
        let createdRecipe = await recipe.create();
        chaiexp(createdRecipe).not.to.be.null;
        chaiexp(createdRecipe?.id).to.be.eq(716428);
        // Let's mock AjaxRequest
        const ajaxRequestMock = mock.ajaxRequest.withValue(null);
        let sameRecipe = await RecipeEntity.getById(716428);
        chaiexp(sameRecipe).not.to.be.null;
        chaiexp(ajaxRequestMock.mock.calls.length).to.be.eq(0);
      });

      test('Event', async () => {
        const createEvent = jest.fn(() => null);
        const singleCreateEvent = jest.fn(() => null);
        const entityCreateEvent = jest.fn(() => null);

        const recipe = new RecipeEntity(100, '', '', '', '', '', '');
        chaiexp(recipe.id).to.be.undefined;

        RecipeEntity.listenAll('create', createEvent);
        recipe['onCreate'] = entityCreateEvent;
        recipe.listen('create', singleCreateEvent);

        let createdRecipe = await recipe.create();
        chaiexp(createdRecipe).not.to.be.null;
        chaiexp(createdRecipe?.id).to.be.eq(716428);
        chaiexp(recipe.id).to.be.eq(716428);

        // Test all event
        chaiexp(createEvent.mock.calls.length).to.be.eq(1);
        const lastCall: any = createEvent.mock.calls[0];
        chaiexp(lastCall[0]).to.be.eq(createdRecipe);
        chaiexp(lastCall[0].id).to.be.eq(716428);

        // Test single event
        chaiexp(singleCreateEvent.mock.calls.length).to.be.eq(1);
        const singleLastCall: any = singleCreateEvent.mock.calls[0];
        chaiexp(singleLastCall[0]).to.be.eq(createdRecipe);
        chaiexp(singleLastCall[0].id).to.be.eq(716428);

        // Test entity event
        chaiexp(entityCreateEvent.mock.calls.length).to.be.eq(1);
      });
    });

    describe('Update', () => {
      test('Update', async () => {
        const recipe: RecipeEntity = await RecipeEntity.getById(716429);
        chaiexp(recipe).not.to.be.null;
        recipe.calories = 654;
        let updatedRecipe = await recipe.update();
        chaiexp(updatedRecipe).not.to.be.null;
        chaiexp(updatedRecipe?.calories).to.be.eq(654);
      });

      test('Ajax', async () => {
        const recipe: RecipeEntity = await RecipeEntity.getById(716429);
        chaiexp(recipe).not.to.be.null;

        // Let's mock AjaxRequest
        const ajaxRequestMock = mock.ajaxRequest.withValue(null);

        recipe.calories = 654;
        const _ = await recipe.update();

        chaiexp(ajaxRequestMock.mock.calls.length).to.be.eq(1);
        const lastCall: any = ajaxRequestMock.mock.calls[0];
        chaiexp(lastCall[0]).to.be.eq('POST');
        chaiexp(lastCall[1]).to.be.eq(`http://localhost:2000/recipe/update/${716429}`);
        chaiexp(lastCall[2]).to.be.deep.eq({
          calories: recipe.calories,
          carbs: recipe.carbs,
          fat: recipe.fat,
          image: recipe.image,
          imageType: recipe.imageType,
          protein: recipe.protein,
          title: recipe.title,
        });
      });

      test('Cache', async () => {
        const recipe: RecipeEntity = await RecipeEntity.getById(716429);
        chaiexp(recipe).not.to.be.null;
        recipe.calories = 654;
        let updatedRecipe = await recipe.update();
        chaiexp(updatedRecipe).not.to.be.null;
        chaiexp(updatedRecipe?.calories).to.be.eq(654);
        // Let's mock AjaxRequest
        const ajaxRequestMock = mock.ajaxRequest.withValue(null);
        let sameRecipe = await RecipeEntity.getById(716429);
        chaiexp(ajaxRequestMock.mock.calls.length).to.be.eq(0);
        chaiexp(sameRecipe).not.to.be.null;
        chaiexp(sameRecipe.id).to.be.eq(716429);
        chaiexp(sameRecipe.calories).to.be.eq(654);
      });

      test('Event', async () => {
        const updateEvent = jest.fn(() => null);
        const singleUpdateEvent = jest.fn(() => null);
        const entityUpdateEvent = jest.fn(() => null);

        const recipe: RecipeEntity = await RecipeEntity.getById(716429);
        chaiexp(recipe).not.to.be.null;
        recipe.calories = 1000;

        RecipeEntity.listenAll('update', updateEvent);
        recipe['onUpdate'] = entityUpdateEvent;
        recipe.listen('update', singleUpdateEvent);

        let updatedRecipe = await recipe.update();
        chaiexp(updatedRecipe).not.to.be.null;
        chaiexp(updatedRecipe?.calories).to.be.eq(1000);

        // Test all event
        chaiexp(updateEvent.mock.calls.length).to.be.eq(1);
        const lastCall: any = updateEvent.mock.calls[0];
        chaiexp(lastCall[0]).to.be.eq(updatedRecipe);
        chaiexp(lastCall[0].calories).to.be.eq(1000);

        // Test single event
        chaiexp(singleUpdateEvent.mock.calls.length).to.be.eq(1);
        const singleLastCall: any = singleUpdateEvent.mock.calls[0];
        chaiexp(singleLastCall[0]).to.be.eq(updatedRecipe);
        chaiexp(lastCall[0].calories).to.be.eq(1000);

        // Test entity event
        chaiexp(entityUpdateEvent.mock.calls.length).to.be.eq(1);
      });
    });

    describe('Delete', () => {
      test('Delete', async () => {
        const recipe: RecipeEntity = await RecipeEntity.getById(716429);
        chaiexp(recipe).not.to.be.null;
        let deleteResult = await recipe.delete();
        chaiexp(deleteResult).to.be.true;
      });

      test('Ajax', async () => {
        const recipe: RecipeEntity = await RecipeEntity.getById(716429);
        chaiexp(recipe).not.to.be.null;

        // Let's mock AjaxRequest
        const ajaxRequestMock = mock.ajaxRequest.withValue(null);

        const _ = await recipe.delete();

        chaiexp(ajaxRequestMock.mock.calls.length).to.be.eq(1);
        const lastCall: any = ajaxRequestMock.mock.calls[0];
        chaiexp(lastCall[0]).to.be.eq('POST');
        chaiexp(lastCall[1]).to.be.eq(`http://localhost:2000/recipe/delete/${716429}`);
      });

      test('Cache', async () => {
        const recipe: RecipeEntity = await RecipeEntity.getById(716429);
        chaiexp(recipe).not.to.be.null;
        // Let's mock AjaxRequest
        const ajaxRequestMock = mock.ajaxRequest.withValue(null);
        const sameRecipe = await RecipeEntity.getById(716429);
        chaiexp(sameRecipe).not.to.be.null;
        chaiexp(ajaxRequestMock.mock.calls.length).to.be.eq(0);
        // Unmock
        mock.ajaxRequest.unMock();
        const deleteRes = await recipe.delete();
        chaiexp(deleteRes).to.be.true;
        // Remock
        const ajaxRequestMock2 = mock.ajaxRequest.withValue(null);
        const tryToFindRecipe = await RecipeEntity.getById(716429);
        chaiexp(ajaxRequestMock2.mock.calls.length).to.be.eq(1);
        chaiexp(tryToFindRecipe).to.be.null;
      });

      test('Event', async () => {
        const deleteEvent = jest.fn(() => null);
        const singleDeleteEvent = jest.fn(() => null);
        const entityDeleteEvent = jest.fn(() => null);

        const recipe = await RecipeEntity.getById(716429);
        chaiexp(recipe).not.to.be.null;

        RecipeEntity.listenAll('delete', deleteEvent);
        recipe['onDelete'] = entityDeleteEvent;
        recipe.listen('delete', singleDeleteEvent);

        let deleteStatus = await recipe.delete();
        chaiexp(deleteStatus).to.be.true;

        // Test all event
        chaiexp(deleteEvent.mock.calls.length).to.be.eq(1);
        const lastCall: any = deleteEvent.mock.calls[0];
        chaiexp(lastCall[0]).to.be.eq(recipe);

        // Test single event
        chaiexp(singleDeleteEvent.mock.calls.length).to.be.eq(1);
        const singleLastCall: any = singleDeleteEvent.mock.calls[0];
        chaiexp(singleLastCall[0]).to.be.eq(recipe);

        // Test entity event
        chaiexp(entityDeleteEvent.mock.calls.length).to.be.eq(1);
      });
    });

    describe('Change', () => {
      test('Change', async () => {
        const recipe: RecipeEntity = await RecipeEntity.getById(716429);
        chaiexp(recipe).not.to.be.null;

        recipe.calories = 2000;
        recipe.change();

        const sameRecipe: RecipeEntity = await RecipeEntity.getById(716429);
        chaiexp(sameRecipe).not.to.be.null;
        chaiexp(sameRecipe.calories).to.be.eq(2000);

        const oldRecipe: RecipeEntity = await RecipeEntity.getById(716429, true);
        chaiexp(oldRecipe).not.to.be.null;
        chaiexp(oldRecipe.calories).not.to.be.eq(2000);
      });

      test('Event', async () => {
        const changeEvent = jest.fn(() => null);
        const singleChangeEvent = jest.fn(() => null);
        const entityChangeEvent = jest.fn(() => null);

        const recipe: RecipeEntity = await RecipeEntity.getById(716429);
        chaiexp(recipe).not.to.be.null;

        RecipeEntity.listenAll('change', changeEvent);
        recipe['onChange'] = entityChangeEvent;
        recipe.listen('change', singleChangeEvent);

        recipe.calories = 500;
        recipe.change();

        // Test all event
        chaiexp(changeEvent.mock.calls.length).to.be.eq(1);
        const lastCall: any = changeEvent.mock.calls[0];
        chaiexp(lastCall[0]).not.to.be.null;
        chaiexp(lastCall[0].calories).to.be.eq(500);

        // Test single event
        chaiexp(singleChangeEvent.mock.calls.length).to.be.eq(1);
        const singleLastCall: any = singleChangeEvent.mock.calls[0];
        chaiexp(singleLastCall[0]).not.to.be.null;
        chaiexp(singleLastCall[0].calories).to.be.eq(500);

        // Test entity event
        chaiexp(entityChangeEvent.mock.calls.length).to.be.eq(1);
      });
    });

    describe('List change', () => {
      test('List change', async () => {
        const listchangeEvent = jest.fn(() => null);
        RecipeEntity.listenAll('listChange', listchangeEvent);

        // Get
        const recipe = await RecipeEntity.getById(716429);
        chaiexp(recipe).not.to.be.null;

        chaiexp(listchangeEvent.mock.calls.length).to.be.eq(1);

        // Get all
        let _ = await RecipeEntity.getAll(true);

        chaiexp(listchangeEvent.mock.calls.length).to.be.eq(2);

        // Create
        const newRecipe: RecipeEntity = (await new RecipeEntity(0, '', '', '', '', '', '').create()) as RecipeEntity;
        chaiexp(newRecipe).not.to.be.null;

        chaiexp(listchangeEvent.mock.calls.length).to.be.eq(3);

        // Update
        newRecipe.calories = 100;
        await newRecipe.update();

        chaiexp(listchangeEvent.mock.calls.length).to.be.eq(4);

        // Delete
        await newRecipe.delete();

        chaiexp(listchangeEvent.mock.calls.length).to.be.eq(5);
      });
    });
  });
});
