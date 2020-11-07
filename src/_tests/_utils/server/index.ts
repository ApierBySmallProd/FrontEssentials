import cors from 'cors';
import express from 'express';

const app = express();

app.use(cors());
app.use(express.json());

const router = express.Router();

router.post('/all', (req, res) => {
  return res.json([
    {
      id: 716429,
      calories: 584,
      carbs: '84g',
      fat: '20g',
      image: 'https://spoonacular.com/recipeImages/716429-312x231.jpg',
      imageType: 'jpg',
      protein: '19g',
      title: 'Pasta with Garlic, Scallions, Cauliflower & Breadcrumbs',
    },
    {
      id: 715538,
      calories: 521,
      carbs: '69g',
      fat: '10g',
      image: 'https://spoonacular.com/recipeImages/715538-312x231.jpg',
      imageType: 'jpg',
      protein: '35g',
      title: 'What to make for dinner tonight?? Bruschetta Style Pork & Pasta',
    },
  ]);
});

router.post('/getone/:id', (req, res) => {
  if (req.params.id === '716429') {
    return res.json({
      id: 716429,
      calories: 584,
      carbs: '84g',
      fat: '20g',
      image: 'https://spoonacular.com/recipeImages/716429-312x231.jpg',
      imageType: 'jpg',
      protein: '19g',
      title: 'Pasta with Garlic, Scallions, Cauliflower & Breadcrumbs',
    });
  } else if (req.params.id === '715538') {
    return res.json({
      id: 715538,
      calories: 521,
      carbs: '69g',
      fat: '10g',
      image: 'https://spoonacular.com/recipeImages/715538-312x231.jpg',
      imageType: 'jpg',
      protein: '35g',
      title: 'What to make for dinner tonight?? Bruschetta Style Pork & Pasta',
      book: {
        id: 1,
        name: 'Cook book',
      },
    });
  }
  return res.sendStatus(404);
});

router.put('/create', (req, res) => {
  return res.json({
    id: 716428,
    calories: req.body.calories,
    carbs: req.body.carbs,
    fat: req.body.fat,
    image: req.body.image,
    imageType: req.body.imageType,
    protein: req.body.protein,
    title: req.body.title,
  });
});

router.post('/update/:id', (req, res) => {
  return res.json({
    id: parseInt(req.params.id, 10),
    calories: req.body.calories,
    carbs: req.body.carbs,
    fat: req.body.fat,
    image: req.body.image,
    imageType: req.body.imageType,
    protein: req.body.protein,
    title: req.body.title,
  });
});

router.post('/delete/:id', (req, res) => {
  return res.sendStatus(200);
});

app.use('/recipe', router);

const bookRooter = express.Router();

bookRooter.get('/:id', (req, res) => {
  return res.json({
    id: 125,
    name: 'Cook book',
    recipes: [
      {
        id: 716429,
        calories: 584,
        carbs: '84g',
        fat: '20g',
        image: 'https://spoonacular.com/recipeImages/716429-312x231.jpg',
        imageType: 'jpg',
        protein: '19g',
        title: 'Pasta with Garlic, Scallions, Cauliflower & Breadcrumbs',
      },
      {
        id: 715538,
        calories: 521,
        carbs: '69g',
        fat: '10g',
        image: 'https://spoonacular.com/recipeImages/715538-312x231.jpg',
        imageType: 'jpg',
        protein: '35g',
        title: 'What to make for dinner tonight?? Bruschetta Style Pork & Pasta',
      },
    ],
  });
});

app.use('/book', bookRooter);

const server = app.listen(2000);

export default server;
