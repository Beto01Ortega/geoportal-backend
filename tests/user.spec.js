const chai    = require('chai');
const request = require('supertest');
const rewire  = require('rewire');
const sinon   = require('sinon');

const sandbox = sinon.createSandbox();
const expect  = chai.expect;

let app = rewire('../app');

describe('Probando ruta /users (Cuentas de Usuario)', () => {
  // var para el token de autorización para realizar las pruebas (admin)
  let token = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpZCI6IjEiLCJlbWFpbCI6ImFkbWluQGxvY2FsaG9zdC5jb20iLCJyb2xlIjp7ImlkX3JvbGUiOiIxIiwibmFtZSI6ImFkbWluIiwiZXh0ZXJuYWxfaWQiOiJkNjE0MzA3Yi1mMzI1LTQzMGItOGFkNC02MzY2ODA2ZmUzYWQiLCJjcmVhdGVkX2F0IjoiMjAyMy0wNy0wOFQyMjowMDowOS45NjVaIiwidXBkYXRlZF9hdCI6IjIwMjMtMDctMDhUMjI6MDA6MDkuOTY1WiJ9LCJpYXQiOjE2ODg4NTM4NTV9.afDeaY84d5lD4v9kiZd7gIQaRBhLdspEh9GKERC2jxM';
  // var para el token de autorización para realizar las pruebas (visitante)
  let visitor = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpZCI6IjEyIiwiZW1haWwiOiJjdWVudGE1QGV4YW1wbGUuY29tIiwicm9sZSI6eyJpZF9yb2xlIjoiMyIsIm5hbWUiOiJ2aXNpdG9yIiwiZXh0ZXJuYWxfaWQiOiJmZWYxMDBjZi04OTNiLTQ4ZGUtYTBlYS0xMmNhOGE3N2QzYjkiLCJjcmVhdGVkX2F0IjoiMjAyNC0wMi0yNlQwMToyMDowMy4zMjJaIiwidXBkYXRlZF9hdCI6IjIwMjQtMDItMjZUMDE6MjA6MDMuMzIyWiJ9LCJpYXQiOjE3MDk3NzQ3OTZ9.NYhJtqPuFmZRnnupnPVTZI0Vr1SUKVWf1vgrL8zhDKI';
  let id = null; // var para el ID del usuario creado

  afterEach(() => {
    app = rewire('../app'); // inyección de dependencias y espionaje de funciones
    sandbox.restore();      // restaura el ambiente de pruebas
  });

  // Prueba No. 1
  describe('Probar Obtención de Usuarios', () => {

    // Prueba positiva
    it('GET /all | Debería devolver los datos de los usuarios registrados.', (done) => {
      request(app)
        .get('/api/v1/users/all')
        .expect('Content-Type', /json/)
        .set('Authorization', `Bearer ${token}`)
        .expect(200)
        .end((err, res) => {
          let arr = res.body;
          if(arr.length > 0) {
            id = arr[0].external_id;
          }
          done(err);
        });
    });

    // Prueba negativa (error)
    it('GET /all | Debería fallar al no tener rol de admin.', (done) => {
      request(app)
        .get('/api/v1/users/all')
        .expect('Content-Type', /json/)
        .set('Authorization', `Bearer ${visitor}`)
        .expect(403)
        .end((err, res) => {
          done(err);
        });
    });

    // Prueba negativa (error)
    it('GET /all | Debería fallar al no tener el token de autorización.', (done) => {
      request(app)
        .get('/api/v1/users/all')
        .expect('Content-Type', /json/)
        .expect(401)
        .end((err, res) => {
          done(err);
        });
    });

    // Prueba positiva
    it('GET /get/:id | Debería devolver los datos de un usuario en específico.', (done) => {
      request(app)
        .get(`/api/v1/users/get/${id}`)
        .expect('Content-Type', /json/)
        .set('Authorization', `Bearer ${token}`)
        .expect(200)
        .end((err, res) => {
          expect(res.body).to.have.property('name');
          expect(res.body).to.have.property('external_id');
          done(err);
        });
    });
  });

  // Prueba No. 2
  describe('Probar Creación de Usuarios', () => {

    // Prueba positiva
    it('POST / | Debería tener éxito cuando se envíen los datos correctos.', (done) => {
      request(app)
        .post('/api/v1/users')
        .set('Authorization', `Bearer ${token}`)
        .expect('Content-Type', /json/)
        .send({
          "name": "User",
          "email": "user4@example.com",
          "password": "user_123",
          "role_id": "2"
        })
        .expect(200)
        .end((err, res) => {
          id = res.body.data;
          expect(res.body).to.have.property('data');
          done(err);
        });
    });

    // Prueba negativa (error)
    it('POST / | Debería fallar cuando se envíen los datos incorrectos.', (done) => {
      request(app)
        .post('/api/v1/users')
        .expect('Content-Type', /json/)
        .send({
          "name": "User",
          "email": "user1@example.com",
          "password": "user_123",
          "role_id": "2"
        })
        .expect(401)
        .end((err, res) => {
          expect(res.body).to.have.property('message');
          done(err);
        });
    });
  });

  // Prueba No. 3
  describe('Probar Eliminar Usuarios', () => {

    // Prueba positiva
    it('DELETE /:id | Debería tener éxito cuando se envían los datos correctos', (done) => {
      request(app)
        .delete(`/api/v1/users/${id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect('Content-Type', /json/)
        .expect(200)
        .end((err, res) => {
          done(err);
        });
    });

    // Prueba negativa (error)
    it('DELETE /:id | Debería tener éxito cuando se envían los datos incorrectos', (done) => {
      request(app)
        .delete(`/api/v1/users/${id}`)
        .expect('Content-Type', /json/)
        .expect(401)
        .end((err, res) => {
          done(err);
        });
    });
  });
});