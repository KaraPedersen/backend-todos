import client from '../lib/client.js';
import supertest from 'supertest';
import app from '../lib/app.js';
import { execSync } from 'child_process';

const request = supertest(app);

describe('API Routes', () => {

  afterAll(async () => {
    return client.end();
  });

  describe('/api/todos', () => {
    let user;

    beforeAll(async () => {
      execSync('npm run recreate-tables');

      const response = await request
        .post('/api/auth/signup')
        .send({
          name: 'Me the User',
          email: 'me@user.com',
          password: 'password'
        });

      expect(response.status).toBe(200);

      user = response.body;
    });
    
    // append the token to your requests:
    //  .set('Authorization', user.token);

    let todo1 = {
      id: 1,
      task: 'wash the dishes',
      completed: false,
      userId: 1,
    };
    
    it('POST todo to /api/todos', async () => {

      const response = await request
        .post('/api/todos')
        .set('Authorization', user.token)
        .send(todo1);
      // remove this line, here to not have lint error:
      
      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        userId: user.id,
        ...todo1
      });

      todo1 = response.body;
    });

    it('GET /api/me/todos ', async () => {

      const toDoResponse = await request
        .post('/api/todos')
        .set('Authorization', user.token)
        .send({
          task: 'wash the dishes',
          completed: false,

          userId: 1,
        });

      expect(toDoResponse.status).toBe(200);
      const otherTodo = toDoResponse.body;

      // we are testing 

      const response = await request.get('/api/todos')
        .set('Authorization', user.token);
      expect(response.status).toBe(200);
      expect(response.body).toEqual(expect.not.arrayContaining([todo1, otherTodo]));
    });

    it('PUT /api/todos/:id/completed', async () => {

      todo1.completed = true;
      todo1.task = 'feed cat';

      // we are testing 

      const response = await request
        .put(`/api/todos/${todo1.id}`)
        .set('Authorization', user.token)
        .send(todo1);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(todo1);
    });

    it('Delete /api/todos/:id', async () => {
      const response = await request.delete(`/api/todos/${todo1.id}`).set('Authorization', user.token);
      expect(response.status).toBe(200);
      expect(response.body).toEqual(todo1);

      const newResponse = await request.get('/api/todos');
      expect(newResponse.status).toBe(200);
      expect(newResponse.body.find(todo => todo.id === todo1.id)).toBeUndefined();

    });

  });

});