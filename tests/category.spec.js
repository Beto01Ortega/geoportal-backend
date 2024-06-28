const chai    = require('chai');
const request = require('supertest');
const rewire  = require('rewire');
const sinon   = require('sinon');

const sandbox = sinon.createSandbox();
const expect  = chai.expect;

let app = rewire('../app');

describe('Probando ruta /categories (Categorías de Capas)', () => {
  // var para el token de autorización para realizar las pruebas
  let token = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpZCI6IjEiLCJlbWFpbCI6ImFkbWluQGxvY2FsaG9zdC5jb20iLCJyb2xlIjp7ImlkX3JvbGUiOiIxIiwibmFtZSI6ImFkbWluIiwiZXh0ZXJuYWxfaWQiOiJkNjE0MzA3Yi1mMzI1LTQzMGItOGFkNC02MzY2ODA2ZmUzYWQiLCJjcmVhdGVkX2F0IjoiMjAyMy0wNy0wOFQyMjowMDowOS45NjVaIiwidXBkYXRlZF9hdCI6IjIwMjMtMDctMDhUMjI6MDA6MDkuOTY1WiJ9LCJpYXQiOjE2ODg4NTM4NTV9.afDeaY84d5lD4v9kiZd7gIQaRBhLdspEh9GKERC2jxM';
  let id = null;       // var para el ID de la categoría creada
  let external = null; // var para el EXTERNAL ID de la categoría creada

  afterEach(() => {
    app = rewire('../app'); // inyección de dependencias y espionaje de funciones
    sandbox.restore();      // restaura el ambiente de pruebas
  });

  // Prueba No. 1
  describe('Probar Obtención de Categorías', () => {

    // Prueba positiva
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

    // Prueba positiva
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

    // Prueba positiva
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

  // Prueba No. 2
  describe('Probar Creación de Categorías', () => {

    // Prueba positiva
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

    // Prueba positiva
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

    // Prueba negativa (error)
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

  // Prueba No. 3
  describe('Probar Modificación de Categorías', () => {

    // Prueba positiva
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

    // Prueba negativa (error)
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

  // Prueba No. 4
  describe('Probar Eliminación de Categorías', () => {

    // Prueba positiva
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

    // Prueba negativa (error)
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