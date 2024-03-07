const chai    = require('chai');
const request = require('supertest');
const rewire  = require('rewire');
const sinon   = require('sinon');

const sandbox = sinon.createSandbox();
const expect  = chai.expect;

let app = rewire('../app');

describe('Probando ruta /categories (Categorías de Capas)', () => {
  let token = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpZCI6IjEiLCJlbWFpbCI6ImFkbWluQGxvY2FsaG9zdC5jb20iLCJyb2xlIjp7ImlkX3JvbGUiOiIxIiwibmFtZSI6ImFkbWluIiwiZXh0ZXJuYWxfaWQiOiJkNjE0MzA3Yi1mMzI1LTQzMGItOGFkNC02MzY2ODA2ZmUzYWQiLCJjcmVhdGVkX2F0IjoiMjAyMy0wNy0wOFQyMjowMDowOS45NjVaIiwidXBkYXRlZF9hdCI6IjIwMjMtMDctMDhUMjI6MDA6MDkuOTY1WiJ9LCJpYXQiOjE2ODg4NTM4NTV9.afDeaY84d5lD4v9kiZd7gIQaRBhLdspEh9GKERC2jxM';
  let id = null;
  let external = null;

  afterEach(() => {
    app = rewire('../app');
    sandbox.restore();
  });

  describe('Probar Obtención de Categorías', () => {
    it('GET /all | Debería devolver los datos de las categorías registradas.', (done) => {
      request(app)
        .get('/api/v1/categories/all')
        .expect('Content-Type', /json/)
        .expect(200)
        .end((err, res) => {
          let arr = res.body;
          if(arr.length > 0) {
            id = arr[0].id_category;
            external = arr[0].external_id;
          }
          done(err);
        });
    });

    it('GET /all/sub/:id | Debería devolver los datos de las subcategorías registradas.', (done) => {
      request(app)
        .get(`/api/v1/categories/all/sub/${id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect('Content-Type', /json/)
        .expect(200)
        .end((err, res) => {
          done(err);
        });
    });

    it('GET /get/:id | Debería devolver los datos de una categoría.', (done) => {
      request(app)
        .get(`/api/v1/categories/get/${external}`)
        .expect('Content-Type', /json/)
        .expect(200)
        .end((err, res) => {
          expect(res.body).to.have.property('name');          
          expect(res.body).to.have.property('external_id');
          expect(res.body).to.have.property('layers');
          expect(res.body).to.have.property('parent_id');
          done(err);
        });
    });
  });

  describe('Probar Creación de Categorías', () => {
    it('POST / | Debería tener éxito cuando se envía los datos correctos.', (done) => {
      request(app)
        .post(`/api/v1/categories`)
        .set('Authorization', `Bearer ${token}`)
        .expect('Content-Type', /json/)
        .send({
          "name": "Prueba 15rem ipsum dolor sit amet, consectetur adipiscing elit"
        })
        .expect(200)
        .end((err, res) => {
          id = res.body.id_category;
          external = res.body.external_id;
          expect(res.body).to.have.property('name');          
          expect(res.body).to.have.property('external_id');
          expect(res.body).to.have.property('layers');
          expect(res.body).to.have.property('parent_id');
          done(err);
        });
    });

    it('POST / | Debería tener éxito cuando se envía los datos correctos (Subcategoría).', (done) => {
      request(app)
        .post(`/api/v1/categories`)
        .set('Authorization', `Bearer ${token}`)
        .expect('Content-Type', /json/)
        .send({
          "name": "Prueba 15rem ipsum dolor sit amet, consectetur adipiscing elit",
          "parent_id": `${id}`
        })
        .expect(200)
        .end((err, res) => {
          external = res.body.external_id;
          expect(res.body).to.have.property('name');          
          expect(res.body).to.have.property('external_id');
          expect(res.body).to.have.property('layers');
          expect(res.body).to.have.property('parent_id');
          done(err);
        });
    });

    it('POST / | Debería fallar cuando se envía los datos incorrectos.', (done) => {
      request(app)
        .post(`/api/v1/categories`)
        .expect('Content-Type', /json/)
        .send({
          "name": "Prueba 15rem ipsum dolor sit amet, consectetur adipiscing elit"
        })
        .expect(401)
        .end((err, res) => {
          expect(res.body).to.have.property('message');
          done(err);
        });
    });
  });

  describe('Probar Modificación de Categorías', () => {
    it('PUT /:id | Debería tener éxito cuando se envía los datos correctos.', (done) => {
      request(app)
        .put(`/api/v1/categories/${external}`)
        .set('Authorization', `Bearer ${token}`)
        .expect('Content-Type', /json/)
        .send({
          "name": "Categoría editada"
        })
        .expect(200)
        .end((err, res) => {
          expect(res.body).to.have.property('data');   
          done(err);
        });
    });

    it('PUT /:id | Debería fallar cuando se envía los datos incorrectos.', (done) => {
      request(app)
        .put(`/api/v1/categories/${external}`)
        .expect('Content-Type', /json/)
        .send({
          "name": "Categoría editada"
        })
        .expect(401)
        .end((err, res) => {
          expect(res.body).to.have.property('message');   
          done(err);
        });
    });
  });

  describe('Probar Eliminación de Categorías', () => {
    it('DELETE /:id | Debería tener éxito cuando se envía los datos correctos.', (done) => {
      request(app)
        .delete(`/api/v1/categories/${external}`)
        .set('Authorization', `Bearer ${token}`)
        .expect('Content-Type', /json/)
        .expect(200)
        .end((err, res) => {
          done(err);
        });
    });

    it('DELETE /:id | Debería fallar cuando se envía los datos incorrectos.', (done) => {
      request(app)
        .delete(`/api/v1/categories/${external}`)
        .expect('Content-Type', /json/)
        .expect(401)
        .end((err, res) => {
          expect(res.body).to.have.property('message');
          done(err);
        });
    });
  });
});